from django.contrib import admin

from expense.models import Expense

# Register your models here.
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'amount', 'date', 'created_at', 'modified_at')
    search_fields = ('category',)
    ordering = ('id',)
    readonly_fields = ('created_at', 'modified_at')
    
admin.site.register(Expense, ExpenseAdmin)