#!/usr/bin/env python3
"""
Project Validator - Checks if all required files are present and valid
"""

import os
import json
import sys

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓{Colors.END} {msg}")

def print_error(msg):
    print(f"{Colors.RED}✗{Colors.END} {msg}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠{Colors.END} {msg}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ{Colors.END} {msg}")

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print_success(f"{description}: {filepath}")
        return True
    else:
        print_error(f"{description} missing: {filepath}")
        return False

def check_json_valid(filepath):
    """Check if JSON file is valid"""
    try:
        with open(filepath, 'r') as f:
            json.load(f)
        print_success(f"Valid JSON: {filepath}")
        return True
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON in {filepath}: {e}")
        return False
    except FileNotFoundError:
        print_error(f"File not found: {filepath}")
        return False

def check_directory_structure():
    """Check directory structure"""
    print("\n" + "=" * 60)
    print("DIRECTORY STRUCTURE")
    print("=" * 60)
    
    dirs = [
        ('css', 'CSS directory'),
        ('js', 'JavaScript directory'),
        ('js/components', 'Components directory'),
        ('js/utils', 'Utils directory'),
        ('js/views', 'Views directory'),
        ('assets', 'Assets directory'),
        ('assets/icons', 'Icons directory')
    ]
    
    all_exist = True
    for dir_path, desc in dirs:
        if os.path.isdir(dir_path):
            print_success(f"{desc}: {dir_path}/")
        else:
            print_error(f"{desc} missing: {dir_path}/")
            all_exist = False
    
    return all_exist

def check_html_files():
    """Check HTML files"""
    print("\n" + "=" * 60)
    print("HTML FILES")
    print("=" * 60)
    
    return check_file_exists('index.html', 'Main HTML file')

def check_css_files():
    """Check CSS files"""
    print("\n" + "=" * 60)
    print("CSS FILES")
    print("=" * 60)
    
    css_files = [
        ('css/main.css', 'Main CSS'),
        ('css/header.css', 'Header CSS'),
        ('css/daily.css', 'Daily view CSS'),
        ('css/weekly.css', 'Weekly view CSS'),
        ('css/monthly.css', 'Monthly view CSS'),
        ('css/settings.css', 'Settings CSS')
    ]
    
    return all(check_file_exists(f, desc) for f, desc in css_files)

def check_js_files():
    """Check JavaScript files"""
    print("\n" + "=" * 60)
    print("JAVASCRIPT FILES")
    print("=" * 60)
    
    js_files = [
        ('js/app.js', 'Main app file'),
        ('js/state.js', 'State management'),
        ('js/datastore.js', 'Data store'),
        ('js/eventbus.js', 'Event bus'),
        ('js/utils/date.js', 'Date utilities'),
        ('js/utils/ui.js', 'UI utilities'),
        ('js/components/header.js', 'Header component'),
        ('js/components/settings.js', 'Settings component'),
        ('js/components/event-modal.js', 'Event modal component'),
        ('js/views/daily.js', 'Daily view'),
        ('js/views/weekly.js', 'Weekly view'),
        ('js/views/monthly.js', 'Monthly view')
    ]
    
    return all(check_file_exists(f, desc) for f, desc in js_files)

def check_pwa_files():
    """Check PWA files"""
    print("\n" + "=" * 60)
    print("PWA FILES")
    print("=" * 60)
    
    files = [
        ('manifest.json', 'PWA manifest'),
        ('sw.js', 'Service Worker')
    ]
    
    result = all(check_file_exists(f, desc) for f, desc in files)
    
    # Validate JSON files
    if os.path.exists('manifest.json'):
        result = check_json_valid('manifest.json') and result
    
    return result

def check_icon_files():
    """Check icon files"""
    print("\n" + "=" * 60)
    print("ICON FILES")
    print("=" * 60)
    
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    all_exist = True
    
    for size in sizes:
        filename = f'assets/icons/icon-{size}.png'
        if os.path.exists(filename):
            print_success(f"Icon {size}x{size}: {filename}")
        else:
            print_warning(f"Icon {size}x{size} missing: {filename}")
            all_exist = False
    
    if not all_exist:
        print_info("Run 'python3 generate-icons.py' to create placeholder icons")
    
    return all_exist

def check_documentation():
    """Check documentation files"""
    print("\n" + "=" * 60)
    print("DOCUMENTATION")
    print("=" * 60)
    
    docs = [
        ('README.md', 'Main README'),
        ('QUICKSTART.md', 'Quick Start guide'),
        ('TECHNICAL.md', 'Technical documentation'),
        ('DEPLOYMENT.md', 'Deployment guide'),
        ('CHANGELOG.md', 'Changelog')
    ]
    
    return all(check_file_exists(f, desc) for f, desc in docs)

def check_file_sizes():
    """Check file sizes (should be reasonable)"""
    print("\n" + "=" * 60)
    print("FILE SIZES")
    print("=" * 60)
    
    total_size = 0
    large_files = []
    
    for root, dirs, files in os.walk('.'):
        # Skip hidden directories and assets
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        
        for file in files:
            if file.endswith(('.js', '.css', '.html', '.json')):
                filepath = os.path.join(root, file)
                size = os.path.getsize(filepath)
                total_size += size
                
                # Flag files > 100KB
                if size > 100 * 1024:
                    large_files.append((filepath, size))
    
    print_info(f"Total bundle size: {total_size / 1024:.1f} KB")
    
    if large_files:
        print_warning("Large files detected (>100KB):")
        for filepath, size in large_files:
            print(f"  - {filepath}: {size / 1024:.1f} KB")
    
    if total_size < 500 * 1024:
        print_success(f"Total size under 500KB target")
        return True
    else:
        print_warning(f"Total size exceeds 500KB - consider optimization")
        return False

def main():
    print("\n" + "=" * 60)
    print("CALENDAR PWA - PROJECT VALIDATOR")
    print("=" * 60)
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    results = []
    
    # Run all checks
    results.append(('Directory Structure', check_directory_structure()))
    results.append(('HTML Files', check_html_files()))
    results.append(('CSS Files', check_css_files()))
    results.append(('JavaScript Files', check_js_files()))
    results.append(('PWA Files', check_pwa_files()))
    results.append(('Icon Files', check_icon_files()))
    results.append(('Documentation', check_documentation()))
    results.append(('File Sizes', check_file_sizes()))
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        if result:
            print_success(f"{name}")
        else:
            print_error(f"{name}")
    
    print("\n" + "-" * 60)
    print(f"Checks passed: {passed}/{total}")
    
    if passed == total:
        print("\n" + Colors.GREEN + "🎉 All checks passed! Project is ready." + Colors.END)
        return 0
    elif passed >= total - 1:
        print("\n" + Colors.YELLOW + "⚠ Almost ready! Fix the issues above." + Colors.END)
        return 1
    else:
        print("\n" + Colors.RED + "❌ Critical issues found. Please fix them." + Colors.END)
        return 1

if __name__ == "__main__":
    sys.exit(main())
