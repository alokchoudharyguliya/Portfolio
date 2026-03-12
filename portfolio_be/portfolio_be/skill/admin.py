from django.contrib import admin
from skill.models import Skill

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'proficiency', 'years_of_experience', 'count_of_projects', 'created_at')
    list_filter = ('proficiency', 'created_at')
    search_fields = ('name', 'description')
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'description')
        }),
        ('Experience', {
            'fields': ('proficiency', 'years_of_experience', 'count_of_projects')
        }),
        ('Media & Links', {
            'fields': ('image', 'certificate_url')
        }),
        ('Metadata', {
            'fields': ('created_at', 'modified_at'),
            'classes': ('collapse',)
        })
    )
    readonly_fields = ('created_at', 'modified_at')
