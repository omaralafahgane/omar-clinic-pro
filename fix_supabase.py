import os
import re

api_dir = os.path.expanduser('~/omar-clinic-pro/app/api')

for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            # Replace import
            content = re.sub(r"import\s+{\s*createClient\s*}\s*from\s*['\"]@supabase/supabase-js['\"];?", 
                            'import { supabaseAdmin as supabase } from "@/lib/supabase";', content)
            
            # Remove direct createClient instantiation
            content = re.sub(r"const\s+supabase\s*=\s*createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL\s*\|\|\s*['\"]['\"],\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY\s*\|\|\s*['\"]['\"]\s*\);?", 
                            '', content)
            
            with open(path, 'w') as f:
                f.write(content)
