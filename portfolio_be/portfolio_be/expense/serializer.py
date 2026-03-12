from expense.models import Expense
from rest_framework import serializers
from django.db.models import Sum
# class ExpenseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Expense
#         fields = '__all__'
        
class ExpenseAPISerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'