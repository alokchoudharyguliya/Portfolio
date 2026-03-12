from django.db import models

from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from base.models import Image, TimestampedModel


# Create your models here.
class Education(TimestampedModel):
    name=models.CharField(max_length=200)
    description=models.TextField(blank=True)
    institution=models.CharField(max_length=200, blank=True)
    start_date=models.DateField(blank=True, null=True)
    end_date=models.DateField(blank=True, null=True)
    coursework=models.TextField(blank=True)
    score=models.CharField(max_length=100, blank=True)
    result=models.FileField(upload_to='education/results/', blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Education'
        verbose_name_plural = 'Education'
        
class EducationImage(Image):
    education = models.ForeignKey(Education, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='education/images/')
    order = models.PositiveIntegerField(default=0)  # Optional field to maintain image order within the album
    
class Achievement(TimestampedModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    issuer = models.CharField(max_length=200, blank=True)
    date = models.DateField(blank=True, null=True)
    result=models.FileField(upload_to='achievement/results/', blank=True, null=True)
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'


# Signal handlers to delete files when model instances are deleted or files are replaced
@receiver(post_delete, sender=Achievement)
def achievement_post_delete(sender, instance, **kwargs):
    """Delete result file when Achievement is deleted."""
    if instance.result:
        try:
            instance.result.delete(save=False)
        except Exception as e:
            print(f"Error deleting achievement result file: {e}")


@receiver(pre_save, sender=Achievement)
def achievement_pre_save(sender, instance, **kwargs):
    """Delete old result file if it's being replaced."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
        old_file = old_instance.result
        new_file = instance.result
        # If old file exists and is different from new file, delete old
        if old_file and (not new_file or old_file.name != new_file.name):
            old_file.delete(save=False)
    except sender.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error in achievement pre_save: {e}")


@receiver(post_delete, sender=Education)
def education_post_delete(sender, instance, **kwargs):
    """Delete result file when Education is deleted."""
    if instance.result:
        try:
            instance.result.delete(save=False)
        except Exception as e:
            print(f"Error deleting education result file: {e}")


@receiver(pre_save, sender=Education)
def education_pre_save(sender, instance, **kwargs):
    """Delete old result file if it's being replaced."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
        old_file = old_instance.result
        new_file = instance.result
        if old_file and (not new_file or old_file.name != new_file.name):
            old_file.delete(save=False)
    except sender.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error in education pre_save: {e}")