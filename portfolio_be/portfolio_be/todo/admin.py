from django.contrib import admin
from todo.models import Todo

# Register your models here.
class TodoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description','priority', 'completed', 'created_at', 'modified_at')
    search_fields = ('title',)
    ordering = ('id',)
    readonly_fields = ('created_at', 'modified_at')
admin.site.register(Todo, TodoAdmin)