# IOC Scraper

A browser extension to extract Indicators of Compromise (IOCs) from threat intelligence articles.

![image](https://github.com/user-attachments/assets/70c46413-1eab-4d04-bb82-f1127af073f9)

## Features

- Extract multiple types of IOCs from web pages
- Export results in CSV, JSON, or YARA format
- Fang/Defang IOCs
- Filter unwanted results
- Whitelisting for common domains

## Supported IOC Types

### IP Addresses
- IPv4 addresses (including defanged format with [.])
- IPv6 addresses (full and shortened formats)

### Domains
- Matches domain names with at least two parts
- Excludes IP addresses
- Excludes domains ending in common file extensions
- Whitelist for common legitimate domains (e.g., microsoft.com, google.com)

### File Hashes
- MD5 (32 characters)
- SHA1 (40 characters)
- SHA256 (64 characters)

### Email Addresses
- Standard email format (user@domain.tld)
- Supports subdomains

### File Paths
- Windows paths (starting with drive letter)
- Unix/Linux paths (limited to common system directories):
  - /etc, /var, /usr, /bin, /sbin
  - /home, /tmp, /opt, /root
  - /boot, /srv, /dev, /proc
  - /sys, /lib, /lib64

### Registry Keys
- Supports all root keys:
  - HKEY_LOCAL_MACHINE
  - HKEY_CURRENT_USER
  - HKEY_USERS
  - HKEY_CLASSES_ROOT
  - HKEY_CURRENT_CONFIG

### CVEs
- Format: CVE-YYYY-NNNNN
- Years: 1999-present
- Supports 4-7 digits for vulnerability number

### Executables
Matches files with extensions:
- exe, dll, bat, ps1
- vbs, js, py, rb
- sh, aspx

## Installation

### Firefox
1. Clone or download this repository
2. Go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `manifest.json` from the downloaded files

### Chrome
1. Clone or download this repository
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the folder containing the extension files

## Usage

1. Navigate to a threat intelligence article
2. Click the IOC Scraper icon in the toolbar
3. Select the types of IOCs you want to extract
4. Click "Extract IOCs"
5. Review the extracted IOCs
6. Remove unwanted items by clicking the 'x'
7. Export results in your preferred format
8. Use fang/defang buttons to toggle IOC format

## Notes

- Domain matching excludes common legitimate domains
- File paths are limited to specific system directories to reduce false positives
- Executable detection includes common script and binary formats
- Some IOCs may appear in multiple categories (e.g., domain in URL path)
