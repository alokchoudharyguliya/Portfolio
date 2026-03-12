from django.contrib import admin
from education.models import Education


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display  = ('name', 'institution', 'start_date', 'end_date', 'score', 'created_at')
    search_fields = ('name', 'institution', 'description')
    list_filter   = ('start_date', 'end_date')
    readonly_fields = ('created_at', 'modified_at')
    fieldsets = (
        ('Basics', {
            'fields': ('name', 'institution', 'start_date', 'end_date', 'score'),
        }),
        ('Details', {
            'fields': ('description', 'coursework'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'modified_at'),
        }),
    )
