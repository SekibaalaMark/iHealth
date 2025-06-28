#!/usr/bin/env python
import os
import sys
import django
from django.core.files.uploadedfile import SimpleUploadedFile

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Child, CustomUser
from datetime import date

def test_add_child_with_photo():
    print("Testing adding a child with photo...")
    
    # Check if we have any CDO users
    cdo_users = CustomUser.objects.filter(role='CDO_HEALTH')
    if not cdo_users.exists():
        print("No CDO_HEALTH users found. Please create one first.")
        return
    
    cdo_user = cdo_users.first()
    print(f"Using CDO user: {cdo_user.username} (center: {cdo_user.center_number})")
    
    # Check existing children
    existing_children = Child.objects.all()
    print(f"Existing children: {existing_children.count()}")
    
    for child in existing_children:
        print(f"  - {child.name} ({child.child_number}) - Photo: {child.photo}")
    
    # Create a test child with photo
    try:
        # Create a simple test image file
        test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\xc7\xd4\x8c\x00\x00\x00\x00IEND\xaeB`\x82'
        test_image = SimpleUploadedFile(
            "test_child.png",
            test_image_content,
            content_type="image/png"
        )
        
        # Create child
        child = Child.objects.create(
            name="Test Child",
            child_number="TEST001",
            center_number=cdo_user.center_number,
            photo=test_image,
            date_of_birth=date(2020, 1, 1)
        )
        
        print(f"\nCreated test child:")
        print(f"  Name: {child.name}")
        print(f"  Number: {child.child_number}")
        print(f"  Photo: {child.photo}")
        print(f"  Photo name: {child.photo.name}")
        print(f"  Photo URL: {child.photo.url}")
        
        return child
        
    except Exception as e:
        print(f"Error creating test child: {e}")
        return None

if __name__ == "__main__":
    test_add_child_with_photo() 