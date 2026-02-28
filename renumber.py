#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to renumber markdown files sequentially
Updates both filenames and front matter
"""

import os
import re
from pathlib import Path

def renumber_files(folder_path='maqamat'):
    """
    Renumber all .md files in the folder sequentially.
    Updates both filenames and front matter.
    
    Args:
        folder_path: Path to the folder containing the files
    """
    # Get all .md files in the folder
    md_files = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.md'):
            # Extract the number from the filename
            match = re.match(r'(\d+)\.md', filename)
            if match:
                current_number = int(match.group(1))
                md_files.append((current_number, filename))
    
    # Sort by current number
    md_files.sort(key=lambda x: x[0])
    
    if not md_files:
        print(f"No .md files found in {folder_path}/")
        return
    
    print(f"Found {len(md_files)} files to renumber")
    print("-" * 50)
    
    # Create temporary renamed files first to avoid conflicts
    temp_renames = []
    for new_number, (old_number, old_filename) in enumerate(md_files, start=1):
        old_path = os.path.join(folder_path, old_filename)
        temp_filename = f"temp_{new_number:02d}.md"
        temp_path = os.path.join(folder_path, temp_filename)
        
        # Read the file content
        with open(old_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update the front matter
        updated_content = update_frontmatter(content, new_number)
        
        # Write to temporary file
        with open(temp_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        temp_renames.append((old_path, temp_path, new_number))
        print(f"{old_filename} -> {new_number:02d}.md (number: {new_number:02d})")
    
    # Delete old files
    for old_path, _, _ in temp_renames:
        os.remove(old_path)
    
    # Rename temp files to final names
    for _, temp_path, new_number in temp_renames:
        final_filename = f"{new_number:02d}.md"
        final_path = os.path.join(folder_path, final_filename)
        os.rename(temp_path, final_path)
    
    print("-" * 50)
    print(f"Successfully renumbered {len(md_files)} files!")

def update_frontmatter(content, new_number):
    """
    Update the 'number' field in the YAML front matter.
    
    Args:
        content: File content as string
        new_number: New number to set
    
    Returns:
        Updated content
    """
    # Pattern to match the front matter number field
    # Matches: number: 7 or number: 07 or number: "7" etc.
    pattern = r'^(number:\s*)(\d+|"\d+")(\s*)$'
    
    lines = content.split('\n')
    result = []
    in_frontmatter = False
    frontmatter_closed = False
    
    for line in lines:
        # Check for front matter delimiters
        if line.strip() == '---':
            result.append(line)
            if not in_frontmatter:
                in_frontmatter = True
            else:
                frontmatter_closed = True
            continue
        
        # If we're in the front matter and haven't closed it yet
        if in_frontmatter and not frontmatter_closed:
            # Check if this is the number line
            match = re.match(pattern, line)
            if match:
                # Replace with new number (zero-padded to 2 digits)
                result.append(f"{match.group(1)}{new_number:02d}{match.group(3)}")
            else:
                result.append(line)
        else:
            result.append(line)
    
    return '\n'.join(result)

if __name__ == "__main__":
    import sys
    
    # Allow specifying folder as command line argument
    folder = sys.argv[1] if len(sys.argv) > 1 else '_maqamat'
    
    if not os.path.exists(folder):
        print(f"Error: Folder '{folder}' not found!")
        sys.exit(1)
    
    renumber_files(folder)