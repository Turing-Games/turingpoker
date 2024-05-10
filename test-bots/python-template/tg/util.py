import re
import json

camel_pat = re.compile(r'([A-Z])')
under_pat = re.compile(r'_([a-z])')

def camel_to_underscore(name):
    return camel_pat.sub(lambda x: '_' + x.group(1).lower(), name)

def underscore_to_camel(name):
    return under_pat.sub(lambda x: x.group(1).upper(), name)

def decamilize(obj):
    if isinstance(obj, dict):
        return {camel_to_underscore(k): decamilize(v) for k, v in obj.items()}
    return obj

def camelize(obj):
    if isinstance(obj, dict):
        return {underscore_to_camel(k): camelize(v) for k, v in obj.items()}
    return obj