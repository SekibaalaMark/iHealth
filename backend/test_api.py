#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Child, CustomUser

def test_verify_child_api():
    print("Testing verify-child API endpoint...")
    
    # Check if we have any children in the database
    children = Child.objects.all()
    print(f"Total children in database: {children.count()}")
    
    if children.count() == 0:
        print("No children found in database. Please add some children first.")
        return
    
    # Check if we have any hospital users
    hospital_users = CustomUser.objects.filter(role='Hospital')
    if not hospital_users.exists():
        print("No Hospital users found. Please create one first.")
        return
    
    hospital_user = hospital_users.first()
    print(f"Using hospital user: {hospital_user.username}")
    
    # Test with the first child
    child = children.first()
    print(f"Testing with child: {child.name} ({child.child_number})")
    print(f"Child photo: {child.photo}")
    
    # Try to make a request to the API
    try:
        # First, we need to get a token for the hospital user
        # For now, let's just test the serializer directly
        from api.serializers import ChildVerificationSerializer
        from rest_framework.test import APIRequestFactory
        
        factory = APIRequestFactory()
        request = factory.post('/api/verify-child/', {
            'child_number': child.child_number
        })
        request.user = hospital_user
        
        serializer = ChildVerificationSerializer(data={'child_number': child.child_number}, context={'request': request})
        
        if serializer.is_valid():
            print("Serializer is valid!")
            result = serializer.data
            print(f"API Response: {json.dumps(result, indent=2)}")
        else:
            print(f"Serializer errors: {serializer.errors}")
            
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_verify_child_api() 