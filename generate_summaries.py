#!/usr/bin/env python3
"""Script to manually generate today's summaries"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from app.utils.prefetch_job import prefetch_and_cache, check_todays_summaries
    
    print("Checking if today's summaries exist...")
    existing_count = check_todays_summaries()
    print(f"Found {existing_count} existing summaries for today")
    
    if existing_count == 0:
        print("No summaries found for today. Generating new ones...")
        result = prefetch_and_cache(force=False)
        print(f"Generation result: {result}")
        
        # Check again
        new_count = check_todays_summaries()
        print(f"After generation: {new_count} summaries now exist for today")
    else:
        print("Summaries already exist for today!")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
