from django.contrib import admin
from auth_user.models import User
# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email')
    # list_filter = ('is_staff', 'is_active')
    search_fields = ('name', 'email')
    ordering = ('id',)

admin.site.register(User,UserAdmin)