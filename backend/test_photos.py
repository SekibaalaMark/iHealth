#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Child

def test_child_photos():
    print("Testing child photos in database...")
    
    children = Child.objects.all()
    print(f"Total children in database: {children.count()}")
    
    for child in children:
        print(f"\nChild: {child.name}")
        print(f"  Number: {child.child_number}")
        print(f"  Photo field: {child.photo}")
        print(f"  Photo name: {getattr(child.photo, 'name', 'No name attribute')}")
        print(f"  Photo URL: {getattr(child.photo, 'url', 'No URL method')}")
        
        # Try to construct URL manually
        if child.photo:
            if hasattr(child.photo, 'name') and child.photo.name:
                manual_url = f"/media/{child.photo.name}"
                print(f"  Manual URL: {manual_url}")
            else:
                print(f"  Manual URL: Cannot construct (no name attribute)")

if __name__ == "__main__":
    test_child_photos() 