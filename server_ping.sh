#!/bin/sh

# tool used to test our backend api

SERVER="http://localhost"
JSON="{\"test\" : \"JSON\"}"
INCLUDE_HEADERS=""

usage() {
  echo usage: "$0" "[-i]" -s http://foobar.com:port/some path/ -d "'"'{"some" : "json"}'"'"
  echo
  echo "\t"-s "\t" address of your server
  echo "\t"-i "\t" include the response header in the print out
  echo "\t"-d "\t" some jason data to send to the server
  echo "\t"-h "\t" print this help message
  echo
}

# parse out the cmdln args
while [ "$#" -gt "0" ]; do
  key="$1"
  case "$key" in
    "-s")
      SERVER="$2"
      shift
      ;;
    
    "-d")
      JSON="$2"
      shift
      ;;

    "-i")
      INCLUDE_HEADERS="-i"
      ;;

    "-h")
      usage
      exit 0
      ;;

    *)
      usage
      exit 1
      ;;
  esac
  shift
done

# ping the server
curl "$SERVER" --data "$JSON" $INCLUDE_HEADERS
echo

