#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to split Maqamat al-Hariri into separate files
Each file will have Jekyll front matter
"""

import os
import re

def split_maqamat(input_file='book_good.md', output_dir='_maqamat'):
    """
    Split the book into separate maqama files.
    
    Args:
        input_file: Path to the input file
        output_dir: Directory to save the split files
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Read the input file
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_maqama = []
    maqama_count = 0
    current_title = ""
    
    for line in lines:
        # Check if line contains "المقامة"
        if "المقامة" in line:
            # If we already have content, save the previous maqama
            if current_maqama:
                save_maqama(current_maqama, maqama_count, current_title, output_dir)
            
            # Start a new maqama
            maqama_count += 1
            current_title = line.strip()
            current_maqama = [line]
        else:
            # Add line to current maqama
            if maqama_count > 0:  # Only add if we've started collecting
                current_maqama.append(line)
    
    # Save the last maqama
    if current_maqama:
        save_maqama(current_maqama, maqama_count, current_title, output_dir)
    
    print(f"Successfully split {maqama_count} maqamat into {output_dir}/")

def save_maqama(content, number, title, output_dir):
    """
    Save a single maqama to a file with Jekyll front matter.
    
    Args:
        content: List of lines for this maqama
        number: Maqama number
        title: Title of the maqama
        output_dir: Directory to save the file
    """
    # Format the filename with zero-padded number
    filename = f"{number:02d}.md"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        # Write Jekyll front matter
        f.write("---\n")
        f.write(f"title: {title}\n")
        f.write(f"number: {number:02d}\n")
        f.write("---\n\n")
        
        # Write the content
        f.writelines(content)
    
    print(f"Created: {filepath}")

if __name__ == "__main__":
    split_maqamat()