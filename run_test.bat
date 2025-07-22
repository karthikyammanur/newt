@echo off
echo Testing urlToImage implementation...
python test_complete_flow.py > test_output.txt 2>&1
echo Test completed. Results saved to test_output.txt
type test_output.txt
