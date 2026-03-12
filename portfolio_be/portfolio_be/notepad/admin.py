from django.contrib import admin
from notepad.models import Drawing


@admin.register(Drawing)
class DrawingAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'canvas_width', 'canvas_height', 'created_at', 'modified_at']
    list_filter = ['created_at']
    search_fields = ['title']
    readonly_fields = ['id', 'created_at', 'modified_at']
