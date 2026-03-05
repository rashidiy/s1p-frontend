#!/bin/bash

# Script to set up local /etc/hosts for subdomain testing
# Run with sudo: sudo ./scripts/setup-local-hosts.sh

HOSTS_FILE="/etc/hosts"
BACKUP_FILE="/etc/hosts.backup.$(date +%Y%m%d_%H%M%S)"

echo "Setting up local hosts for S1P subdomain testing..."

# Backup hosts file
echo "Creating backup: $BACKUP_FILE"
cp $HOSTS_FILE $BACKUP_FILE

# Check if entries already exist
if grep -q "# S1P Local Development" $HOSTS_FILE; then
    echo "S1P entries already exist in hosts file"
    echo "Remove manually or restore from backup if needed"
    exit 1
fi

# Add entries
echo "" >> $HOSTS_FILE
echo "# S1P Local Development" >> $HOSTS_FILE
echo "127.0.0.1  owner.localhost" >> $HOSTS_FILE
echo "127.0.0.1  company1.localhost" >> $HOSTS_FILE
echo "127.0.0.1  company2.localhost" >> $HOSTS_FILE
echo "127.0.0.1  company3.localhost" >> $HOSTS_FILE

echo "✓ Hosts file updated successfully"
echo ""
echo "You can now access:"
echo "  Owner Portal:    http://owner.localhost:3000"
echo "  Company1 Portal: http://company1.localhost:3000"
echo "  Company2 Portal: http://company2.localhost:3000"
echo ""
echo "To remove these entries, restore from backup:"
echo "  sudo cp $BACKUP_FILE $HOSTS_FILE"
