
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
# ------------------------------
# Custom User with roles
# ------------------------------


from django.utils import timezone

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('CDO_HEALTH', 'CDO HEALTH'),
        ('Hospital', 'Hospital'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    center_number = models.CharField(max_length=10)
    username = models.CharField(max_length=200,unique=True)
    email=models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    confirmation_code = models.CharField(max_length=6, blank=True, null=True)
    reset_code_sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"




from django.db import models
from datetime import date




class Child(models.Model):
    name = models.CharField(max_length=100)
    child_number = models.CharField(max_length=20, unique=True)
    center_number = models.CharField(max_length=6)
    photo = models.ImageField(upload_to='child_photos/')
    date_added = models.DateTimeField(auto_now_add=True)
    
    date_of_birth = models.DateField()  # New field for date of birth

    @property
    def age(self):
        today = date.today()
        dob = self.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def __str__(self):
        return f"{self.name} - {self.child_number}"



class MedicalRecord(models.Model):
    child = models.ForeignKey(Child, on_delete=models.CASCADE)
    #hospital = models.CharField(max_length=200)
    hospital = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'Hospital'})
    date_of_visit = models.DateField(auto_now_add=True)
    disease_description = models.TextField()
    hospital_bill = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.child.child_number} - {self.date_of_visit}"
    

'''
# ------------------------------
# Center Model
# ------------------------------
class Center(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=150)

    def __str__(self):
        return self.name
'''


'''
# ------------------------------
# Hospital Model
# ------------------------------
class Hospital(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=150)
    partnered_centers = models.ManyToManyField(Center, related_name='partner_hospitals')

    def __str__(self):
        return self.name
'''


# ------------------------------
# Child Model
# ------------------------------


# ------------------------------
# MedicalRecord Model
# ------------------------------


