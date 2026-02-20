/**
 * Generate SVG placeholder preview for resume templates
 * Creates visual representation of template layout
 */

export function generateTemplatePlaceholder(template: {
  name: string
  category: string
  style: {
    colors: {
      primary: string
      background: string
      border: string
    }
  }
  layout: {
    type: string
  }
}): string {
  const { primary, background, border } = template.style.colors
  const layoutType = template.layout.type

  // Create SVG based on layout type
  const svgContent = `
    <svg width="340" height="440" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="340" height="440" fill="${background}"/>

      ${
        layoutType === 'single-column'
          ? `
        <!-- Single Column Layout -->
        <rect x="20" y="20" width="200" height="30" fill="${primary}" rx="4"/>
        <rect x="20" y="60" width="150" height="8" fill="${border}" rx="2"/>
        <rect x="20" y="72" width="130" height="8" fill="${border}" rx="2"/>

        <rect x="20" y="100" width="60" height="12" fill="${primary}" rx="2"/>
        <rect x="20" y="120" width="300" height="6" fill="${border}" rx="2"/>
        <rect x="20" y="130" width="280" height="6" fill="${border}" rx="2"/>
        <rect x="20" y="140" width="290" height="6" fill="${border}" rx="2"/>

        <rect x="20" y="160" width="60" height="12" fill="${primary}" rx="2"/>
        <rect x="20" y="180" width="300" height="6" fill="${border}" rx="2"/>
        <rect x="20" y="190" width="280" height="6" fill="${border}" rx="2"/>
        <rect x="20" y="200" width="290" height="6" fill="${border}" rx="2"/>

        <rect x="20" y="220" width="60" height="12" fill="${primary}" rx="2"/>
        <rect x="20" y="240" width="250" height="6" fill="${border}" rx="2"/>
        <rect x="20" y="250" width="240" height="6" fill="${border}" rx="2"/>
        `
          : layoutType === 'two-column'
          ? `
        <!-- Two Column Layout -->
        <!-- Left Column -->
        <rect x="20" y="20" width="140" height="400" fill="${primary}10" rx="4"/>
        <rect x="30" y="30" width="100" height="20" fill="${primary}" rx="2"/>
        <rect x="30" y="60" width="80" height="6" fill="${border}" rx="2"/>
        <rect x="30" y="70" width="90" height="6" fill="${border}" rx="2"/>

        <rect x="30" y="100" width="40" height="10" fill="${primary}" rx="2"/>
        <rect x="30" y="115" width="100" height="4" fill="${border}" rx="1"/>
        <rect x="30" y="122" width="100" height="4" fill="${border}" rx="1"/>
        <rect x="30" y="129" width="100" height="4" fill="${border}" rx="1"/>

        <!-- Right Column -->
        <rect x="180" y="30" width="130" height="20" fill="${primary}" rx="2"/>
        <rect x="180" y="60" width="100" height="6" fill="${border}" rx="2"/>
        <rect x="180" y="70" width="120" height="6" fill="${border}" rx="2"/>
        <rect x="180" y="80" width="110" height="6" fill="${border}" rx="2"/>

        <rect x="180" y="110" width="50" height="10" fill="${primary}" rx="2"/>
        <rect x="180" y="130" width="130" height="6" fill="${border}" rx="2"/>
        <rect x="180" y="140" width="120" height="6" fill="${border}" rx="2"/>
        `
          : layoutType === 'sidebar'
          ? `
        <!-- Sidebar Layout -->
        <!-- Colored Sidebar -->
        <rect x="0" y="0" width="120" height="440" fill="${primary}" rx="0"/>
        <rect x="20" y="30" width="80" height="16" fill="white" rx="2"/>
        <rect x="20" y="55" width="60" height="6" fill="white" opacity="0.8" rx="1"/>
        <rect x="20" y="65" width="70" height="6" fill="white" opacity="0.8" rx="1"/>

        <rect x="20" y="100" width="40" height="8" fill="white" rx="1"/>
        <rect x="20" y="115" width="80" height="4" fill="white" opacity="0.7" rx="1"/>
        <rect x="20" y="122" width="80" height="4" fill="white" opacity="0.7" rx="1"/>

        <!-- Main Content -->
        <rect x="140" y="30" width="170" height="20" fill="${primary}" rx="2"/>
        <rect x="140" y="60" width="150" height="6" fill="${border}" rx="2"/>
        <rect x="140" y="70" width="160" height="6" fill="${border}" rx="2"/>
        `
          : `
        <!-- Modern Split Layout -->
        <rect x="20" y="20" width="300" height="30" fill="${primary}" rx="4"/>
        <rect x="20" y="60" width="140" height="6" fill="${border}" rx="2"/>

        <rect x="20" y="90" width="140" height="150" fill="${primary}10" rx="4"/>
        <rect x="30" y="100" width="50" height="10" fill="${primary}" rx="2"/>
        <rect x="30" y="120" width="100" height="6" fill="${border}" rx="2"/>

        <rect x="180" y="90" width="140" height="150" fill="${primary}10" rx="4"/>
        <rect x="190" y="100" width="50" height="10" fill="${primary}" rx="2"/>
        <rect x="190" y="120" width="100" height="6" fill="${border}" rx="2"/>
        `
      }
    </svg>
  `

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svgContent)}`
}
