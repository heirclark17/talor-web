#!/bin/bash

# Extract sections
sed -n '1,230p' CareerPathDesignerScreen.test.tsx > header.tmp
sed -n '810,1097p' CareerPathDesignerScreen.test.tsx > upload.tmp
sed -n '1098,1760p' CareerPathDesignerScreen.test.tsx > questions.tmp
sed -n '1761,2022p' CareerPathDesignerScreen.test.tsx > generation.tmp
sed -n '2023,$p' CareerPathDesignerScreen.test.tsx > results.tmp

# Create upload test
cat header.tmp upload.tmp > CareerPathDesignerScreen.upload.test.tsx
echo '});' >> CareerPathDesignerScreen.upload.test.tsx
sed -i '154s/describe.skip/describe/' CareerPathDesignerScreen.upload.test.tsx

# Create questions test
cat header.tmp questions.tmp > CareerPathDesignerScreen.questions.test.tsx
echo '});' >> CareerPathDesignerScreen.questions.test.tsx
sed -i '154s/describe.skip/describe/' CareerPathDesignerScreen.questions.test.tsx

# Create generation test (keep .skip)
cat header.tmp generation.tmp > CareerPathDesignerScreen.generation.test.tsx
echo '});' >> CareerPathDesignerScreen.generation.test.tsx

# Create results test
cat header.tmp results.tmp > CareerPathDesignerScreen.results.test.tsx
sed -i '154s/describe.skip/describe/' CareerPathDesignerScreen.results.test.tsx

# Clean up temp files
rm -f header.tmp upload.tmp questions.tmp generation.tmp results.tmp welcome.tmp

echo "Split complete!"
