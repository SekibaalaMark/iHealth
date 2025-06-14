from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import *

User = get_user_model()

class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role', 'center_number')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn’t match."})

        if not attrs.get('center_number'):
            raise serializers.ValidationError({"center_number": "This field is required for all users."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            center_number=validated_data['center_number']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user




class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ['id', 'name', 'child_number', 'center_number', 'photo', 'date_added']
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
        fields = ['id', 'child_number', 'child', 'hospital', 'date_of_visit', 'disease_description', 'hospital_bill']
        read_only_fields = ['child', 'hospital']

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
            "photo": child.photo.url if child.photo else None
        }


from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser

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
