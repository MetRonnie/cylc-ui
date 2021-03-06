from os.path import dirname
from pathlib import Path
import re

graphql_module_path = Path(f'{dirname(__file__)}/../../../graphql/')
queries_file = graphql_module_path / 'queries.js'

workflows_query_variable = 'WORKFLOW_TREE_QUERY'

query = ''

# use a regex to match anything after the variable name and within ``
# for js multiline variable
with queries_file.open() as f:
    query = re.search(
        rf'const\s+{workflows_query_variable}\s*=\s*`([^`]+)`',
        f.read(),
        re.MULTILINE).group(1).strip()
    # replace the placeholder for the workflow ID
    query = query.replace('(ids: ["WORKFLOW_ID"])', '', 1)
    if query.startswith('subscription'):
        query = query.replace('subscription', '', 1)


wrapper = {
    'request_string': query
}

import json
print(json.dumps(wrapper, indent=2))
