from expense.models import Expense
from rest_framework.response import Response
from rest_framework import generics, status
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
# from .serializer import ExpenseSerializer
from django.db.models import Sum
from .serializer import ExpenseAPISerializer
from rest_framework.viewsets import GenericViewSet, ModelViewSet, ViewSet
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.decorators import action
from django.http import StreamingHttpResponse
import csv
import io


# # ── ViewSet-based view ────────────────────────────────────────────────────────
# class ExpenseView(ViewSet):
#     serializer_class = ExpenseSerializer

#     @extend_schema(
#         summary="List all expenses",
#         responses={200: ExpenseSerializer(many=True)},
#     )
#     def list(self, request):
#         queryset = Expense.objects.all()
#         serializer = ExpenseSerializer(queryset, many=True)
#         return Response(serializer.data)

#     @extend_schema(
#         summary="Create a new expense",
#         request=ExpenseSerializer,
#         responses={201: ExpenseSerializer, 400: None},
#     )
#     def create(self, request):
#         serializer = ExpenseSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# # ── Generic API view ─────────────────────────────────────────────────────────
# @extend_schema_view(
#     get=extend_schema(summary="List all expenses (generic)", responses={200: ExpenseAPISerializer(many=True)}),
#     post=extend_schema(summary="Create expense (generic)", request=ExpenseAPISerializer, responses={201: ExpenseAPISerializer}),
#     delete=extend_schema(summary="Delete all expenses (generic)", responses={204: None, 400: None}),
# )
# class ExpenseAPIView(generics.ListCreateAPIView):
#     queryset = Expense.objects.all()
#     serializer_class = ExpenseAPISerializer
#     filter_backends = [DjangoFilterBackend, OrderingFilter]
#     filterset_fields = ['category', 'date']      # simple exact filters
#     ordering_fields = ['amount', 'created_at']  # allow ?ordering=amount or -created_at
#     ordering = ['-created_at'] 

# class ExpenseGenericViewSet(ListModelMixin, CreateModelMixin, RetrieveModelMixin, GenericViewSet):
#     queryset = Expense.objects.all()
#     serializer_class = ExpenseSerializer
    
    
@extend_schema_view(
    list=extend_schema(summary="List all expenses (ModelViewSet)", responses={200: ExpenseAPISerializer(many=True)}),
    create=extend_schema(summary="Create expense (ModelViewSet)", request=ExpenseAPISerializer, responses={201: ExpenseAPISerializer}),
    retrieve=extend_schema(summary="Retrieve expense by ID (ModelViewSet)", responses={200: ExpenseAPISerializer, 404: None}),
)
class ExpenseModelViewSet(ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseAPISerializer
    
    def list(self, request, *args, **kwargs):
        """Return list of expenses plus aggregated stats (total_expenditure)."""
        queryset = self.filter_queryset(self.get_queryset())

        # serialize all expenses
        serializer = self.get_serializer(queryset, many=True)

        # compute total expenditure across the queryset
        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        # Return raw payload (no top-level `success`) — middleware will wrap it.
        return Response({
            "expenses": serializer.data,
            "total_expenditure": total,
        })
    # filtering/ordering/search
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'date']
    ordering_fields = ['amount', 'created_at','date']
    ordering = ['-created_at']
    search_fields = ['description']
    
    @action(detail=False, methods=['get'])
    @extend_schema(summary="Download CSV report of expenses", responses={200: OpenApiResponse(description="CSV file")})
    def report(self, request, *args, **kwargs):
        """Stream a CSV export of expenses matching the current filters.

        This uses `QuerySet.values_list(...).iterator()` and Django's
        `StreamingHttpResponse` to avoid loading all rows into memory,
        which keeps memory usage low even for very large datasets.
        """

        # Apply the same filtering/ordering/search that the viewset supports
        qs = self.filter_queryset(self.get_queryset())

        # Select only needed fields to reduce memory and DB transfer
        values_qs = qs.values_list('id', 'date', 'category', 'amount', 'description', 'created_at')

        # CSV writer requires a file-like object; we'll reuse a small StringIO buffer
        def row_generator():
            buf = io.StringIO()
            writer = csv.writer(buf)

            # header
            writer.writerow(['id', 'date', 'category', 'amount', 'description', 'created_at'])
            yield buf.getvalue()
            buf.seek(0); buf.truncate(0)

            # iterate in database cursor-friendly mode
            for row in values_qs.iterator(chunk_size=1000):
                # convert datetimes/dates to ISO strings and amounts to string
                id_, date, category, amount, description, created_at = row
                date_val = date.isoformat() if date is not None else ''
                created_val = created_at.isoformat() if created_at is not None else ''
                writer.writerow([id_, date_val, category or '', str(amount), description or '', created_val])
                yield buf.getvalue()
                buf.seek(0); buf.truncate(0)

        response = StreamingHttpResponse(row_generator(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses_report.csv"'
        # advisable for some proxy setups to disable buffering
        response['X-Accel-Buffering'] = 'no'
        return response
