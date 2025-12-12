#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to close unclosed <div class="poem"> tags
Inserts </div> before the first text not inside an HTML tag
"""

import re

def close_poem_divs(input_file, output_file=None):
    """
    Find unclosed <div class="poem"> tags and close them properly.
    
    Args:
        input_file: Path to the input file
        output_file: Path to the output file (if None, overwrites input)
    """
    if output_file is None:
        output_file = input_file
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Process the content
    fixed_content = fix_poem_divs(content)
    
    # Write the result
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"Fixed poem divs and saved to: {output_file}")

def fix_poem_divs(content):
    """
    Fix unclosed poem div tags in the content.
    """
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        result.append(line)
        
        # Check if this line has an opening <div class="poem">
        if '<div class="poem">' in line:
            # Check if it already has a closing tag on the same line
            if '</div>' in line and line.index('</div>') > line.index('<div class="poem">'):
                i += 1
                continue
            
            # Find where to insert the closing tag
            closing_index = find_closing_position(lines, i + 1)
            
            if closing_index is not None:
                # Insert the closing tag
                insert_closing_tag(result, lines, i + 1, closing_index)
                i = closing_index
            else:
                i += 1
        else:
            i += 1
    
    return '\n'.join(result)

def find_closing_position(lines, start_index):
    """
    Find where to insert the closing </div> tag.
    Returns the line index where first text outside tags appears.
    """
    nesting_level = 0
    
    for i in range(start_index, len(lines)):
        line = lines[i].strip()
        
        if not line:
            continue
        
        # Count opening and closing tags
        # Remove self-closing tags first
        line_temp = re.sub(r'<[^>]+/>', '', line)
        
        # Count opening tags (excluding closing tags)
        opening_tags = len(re.findall(r'<(?!/)(?!!)[^>]+>', line_temp))
        closing_tags = len(re.findall(r'</[^>]+>', line_temp))
        
        nesting_level += opening_tags
        nesting_level -= closing_tags
        
        # If nesting level is 0 and we have text content (not just tags)
        if nesting_level == 0:
            # Remove all tags and see if there's text left
            text_only = re.sub(r'<[^>]+>', '', line).strip()
            if text_only:
                return i
    
    return None

def insert_closing_tag(result, lines, start_index, target_index):
    """
    Insert lines up to target, then insert closing tag before the text.
    """
    # Add all lines up to but not including the target
    for i in range(start_index, target_index):
        result.append(lines[i])
    
    # Now handle the target line - insert </div> before the first text
    target_line = lines[target_index]
    
    # Find the position of the first text (after any leading whitespace and tags)
    match = re.search(r'^(\s*(?:<[^>]+>\s*)*)(.+)$', target_line)
    
    if match:
        # Insert the closing tag after tags but before text
        prefix = match.group(1)  # whitespace and tags
        text = match.group(2)     # the actual text
        
        result.append(prefix + '</div>')
        result.append(prefix + text)
    else:
        # Fallback: just add the closing tag and the line
        result.append('</div>')
        result.append(target_line)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python close_poem_divs.py <input_file> [output_file]")
        print("If output_file is not specified, the input file will be modified.")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    close_poem_divs(input_file, output_file)