from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import *



import random
from rest_framework import serializers
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser 
        fields = ['id', 'email', 'username', 'password', 'password2', 'role', 'center_number', 'is_verified']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'email': {'required': True},
            'username': {'required': True},
            'center_number': {'required': True},
            'role': {'required': True},
            'is_verified': {'read_only': True},
        }

    def validate(self, data):
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        password2 = data.get('password2')
        role = data.get('role')
        center_number = data.get('center_number')

        if CustomUser.objects.filter(username=username).exists():
            raise serializers.ValidationError('Username already exists')

        if role not in dict(CustomUser.ROLE_CHOICES):
            raise serializers.ValidationError("Invalid role selected")

        if role == 'CDO_HEALTH':
            if center_number and CustomUser.objects.filter(center_number=center_number).exists():
                raise serializers.ValidationError('CDO health from this center already exists')

        if '@' not in email or not email.endswith('gmail.com'):
            raise serializers.ValidationError('Only Gmail accounts are allowed.')

        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists")

        if len(password) < 8 or len(password2) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")

        if password != password2:
            raise serializers.ValidationError("Passwords do not match")

        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        # Generate a random 6-digit confirmation code
        confirmation_code = str(random.randint(100000, 999999))

        user = CustomUser(
            **validated_data,
            is_verified=False,
            confirmation_code=confirmation_code
        )
        user.set_password(password)
        user.save()

        # Email sending should happen in the view after this serializer is used
        return user



class LoginSerializer2(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)



class ChildSerializer(serializers.ModelSerializer):
    date_of_birth = serializers.DateField(
        input_formats=['%d/%m/%Y'],  # Accepts DD/MM/YYYY
        format='%d/%m/%Y'            # Also displays in this format
    )
    age = serializers.ReadOnlyField()  # Since it's a property
    class Meta:
        model = Child
        fields = ['id', 'name', 'child_number', 'center_number', 'photo', 'date_added','date_of_birth','age']
        read_only_fields = ['date_added']

    def validate_child_number(self, value):
        if Child.objects.filter(child_number=value).exists():
            raise serializers.ValidationError("Child with this number already exists.")
        return value



from django.utils import timezone

class MedicalRecordSerializer(serializers.ModelSerializer):
    child_number = serializers.CharField(write_only=True)
    hospital = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = MedicalRecord
        fields = ['id', 'child_number', 'child', 'hospital', 'disease_description', 'hospital_bill']
        read_only_fields = ['child', 'hospital','date_of_visit']
        extra_kwargs={
            'child_number':{'required':True},
            'disease_description':{'required':True},
            'hospital_bill':{'required':True}
        }

    def validate_child_number(self, value):
        try:
            child = Child.objects.get(child_number=value)
        except Child.DoesNotExist:
            raise serializers.ValidationError("No child with this number found.")
        return value

    def create(self, validated_data):
        child_number = validated_data.pop('child_number')
        child = Child.objects.get(child_number=child_number)

        medical_record = MedicalRecord.objects.create(
            child=child,
            hospital=self.context['request'].user,
            **validated_data
        )
        return medical_record



class ChildVerificationSerializer(serializers.Serializer):
    child_number = serializers.CharField(write_only=True)
    name = serializers.CharField(read_only=True)
    photo = serializers.ImageField(read_only=True)

    def validate(self, attrs):
        child_number = attrs.get('child_number')
        user = self.context['request'].user

        # Ensure only hospital users use this
        if user.role != 'Hospital':
            raise serializers.ValidationError("Only hospital users can verify child numbers.")

        try:
            child = Child.objects.get(child_number=child_number)
        except Child.DoesNotExist:
            raise serializers.ValidationError("No child with this number exists.")

        # Check center number match
        if child.center_number != user.center_number:
            raise serializers.ValidationError("This child does not belong to your assigned center.")

        # Attach validated child for use in `to_representation`
        attrs['child'] = child
        return attrs

    def to_representation(self, instance):
        child = self.validated_data['child']
        return {
            "name": child.name,
            "photo": child.photo.url if child.photo else None,
            "age":child.age
        }



from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    username = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    center_number = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        attrs['access'] = str(refresh.access_token)
        attrs['refresh'] = str(refresh)
        attrs['username'] = user.username
        attrs['role'] = user.role
        attrs['center_number'] = user.center_number

        return attrs



class MedicalRecordListSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.name', read_only=True)
    child_number = serializers.CharField(source='child.child_number', read_only=True)
    hospital_name = serializers.CharField(source='hospital.username', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'child_name',
            'child_number',
            'hospital_name',
            'date_of_visit',
            'disease_description',
            'hospital_bill',
        ]



class ChildUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ['name', 'photo', 'date_of_birth']  # Updatable fields only





class ResendConfirmationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

        if user.is_verified:
            raise serializers.ValidationError("This account is already verified.")
        
        return value



class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value



class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    confirmation_code = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")

        try:
            user = CustomUser.objects.get(email=data['email'], confirmation_code=data['confirmation_code'])
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Invalid email or confirmation code.")

        return data

    def save(self):
        user = CustomUser.objects.get(email=self.validated_data['email'])
        user.set_password(self.validated_data['new_password'])
        user.confirmation_code = ""  # Clear code after use
        user.save()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    



# serializers.py

class HospitalMedicalRecordSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='child.name', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = ['name', 'date_of_visit', 'disease_description', 'hospital_bill']
