from django.db import models
from base.models import Image, TimestampedModel
# Create your models here.
class Skill(TimestampedModel):
    name = models.CharField(max_length=100)
    proficiency = models.IntegerField(default=3, blank=True)  # Optional field for proficiency level (1-5)
    years_of_experience = models.FloatField(default=0, blank=True)  # Optional field for years of experience
    count_of_projects = models.IntegerField(default=0, blank=True)  # Optional field to list projects using this skill
    certificate_url = models.URLField(blank=True, null=True)  # Optional field to link to a certificate or proof of skill
    description = models.TextField(blank=True, null=True)  # Optional field for additional details about the skill
    # image_url = models.URLField(blank=True, null=True)  # Optional field to link to an image representing the skill
    # image = models.ImageField(upload_to='images/skills/', blank=True, null=True)  # Optional field to upload an image representing the skill
    skill_image= models.OneToOneField('SkillImage', on_delete=models.SET_NULL, blank=True, null=True, related_name='skills')  
    def __str__(self):
        return self.name
    
    
class SkillImage(Image):
    image = models.ImageField(upload_to='skill/images/')

    class Meta:
        pass
    def __str__(self):
        try:
            return f'{self.skills.name} - Image'
        except Exception:
            return f'SkillImage {self.pk}'