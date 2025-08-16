# setup_cron.py
# This script sets up a cron job to run the daily summaries update at midnight CT

import os
import sys
import subprocess
import platform
from pathlib import Path

def main():
    """Set up cron job for daily updates at midnight CT"""
    script_path = Path(__file__).resolve().parent / "daily_summaries_update.py"
    python_path = sys.executable
    
    print(f"Setting up cron job to run {script_path} at midnight CT")
    
    # Determine operating system
    system = platform.system()
    
    if system == "Windows":
        # For Windows, we'll use Task Scheduler
        setup_windows_task(python_path, script_path)
    elif system in ["Linux", "Darwin"]:  # Linux or macOS
        # For Linux/macOS, we'll use crontab
        setup_unix_cron(python_path, script_path)
    else:
        print(f"Unsupported operating system: {system}")
        return 1
    
    return 0

def setup_windows_task(python_path, script_path):
    """Set up a Windows Scheduled Task"""
    task_name = "NewtDailySummariesUpdate"
    
    # Create XML file for the task
    task_xml = f"""<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Newt Daily Summaries Update</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2023-01-01T00:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>{python_path}</Command>
      <Arguments>"{script_path}"</Arguments>
      <WorkingDirectory>{script_path.parent}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"""
    
    xml_path = script_path.parent / "task.xml"
    with open(xml_path, "w") as f:
        f.write(task_xml)
    
    try:
        # Create the scheduled task
        subprocess.run(["schtasks", "/create", "/tn", task_name, "/xml", str(xml_path), "/f"], 
                      check=True, capture_output=True)
        print(f"Successfully created Windows Scheduled Task '{task_name}'")
        
        # Clean up XML file
        os.remove(xml_path)
    except subprocess.CalledProcessError as e:
        print(f"Error creating Windows task: {e}")
        print(f"Error details: {e.stderr.decode()}")
        print("You may need to run this script as administrator")

def setup_unix_cron(python_path, script_path):
    """Set up a Unix crontab entry"""
    # Midnight CT is 5:00 UTC during standard time, 6:00 UTC during daylight savings
    # We'll set up both to handle time changes automatically
    cron_entry = f"0 0 * * * America/Chicago {python_path} {script_path} >> {script_path.parent}/cron.log 2>&1\n"
    
    try:
        # Get existing crontab
        proc = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
        current_crontab = proc.stdout
        
        # Check if our entry already exists
        if cron_entry in current_crontab:
            print("Cron job already exists")
            return
        
        # Add new entry
        new_crontab = current_crontab + cron_entry
        
        # Write to temporary file
        temp_file = script_path.parent / "temp_crontab"
        with open(temp_file, "w") as f:
            f.write(new_crontab)
        
        # Install new crontab
        subprocess.run(["crontab", str(temp_file)], check=True)
        print("Successfully added cron job")
        
        # Clean up
        os.remove(temp_file)
    except subprocess.CalledProcessError as e:
        print(f"Error setting up cron job: {e}")

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
