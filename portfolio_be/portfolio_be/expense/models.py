from django.db import models
from base.models import TimestampedModel

# Create your models here.
class Expense(TimestampedModel):
    category=models.CharField(max_length=100)
    amount=models.IntegerField()
    description=models.TextField(blank=True, null=True)
    date=models.DateField()
    def __str__(self):
        return f"{self.category} - {self.amount}"