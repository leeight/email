#!/usr/bin/env bash

curl -XDELETE 'http://localhost:9200/baidu/'
curl -XPUT 'http://localhost:9200/baidu/'
curl -XPOST http://localhost:9200/baidu/mails/_mapping -d'
{
    "mails": {
        "_all": {
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "term_vector": "no",
            "store": "false"
        },
        "properties": {
            "subject": {
                "type": "string",
                "store": "no",
                "term_vector": "with_positions_offsets",
                "indexAnalyzer": "ik",
                "searchAnalyzer": "ik",
                "include_in_all": "true",
                "boost": 8
            }
        }
    }
}'
