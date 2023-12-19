#!/bin/bash

# Run your server
npm run start &

# Store the process ID (PID) of the server
server_pid=$!

# Function to check the response status
check_status() {
    response_backupshie=$(curl --write-out %{http_code} --silent --output /dev/null 'localhost:3000/backupshie')
    response_rh4backup=$(curl --write-out %{http_code} --silent --output /dev/null 'localhost:3000/rh4backup')

    if [ $response_backupshie -eq 200 ] ; then
        echo "Response status is 200 response_backupshie , response_rh4backup "
        # Terminate the server
        kill $server_pid
        exit 0
    fi
    echo "รอสถานะการ Dump ข้อมูล"
}

# Loop to check response status every 5 seconds
while : ; do
    check_status
    sleep 5
done


npm run kill
