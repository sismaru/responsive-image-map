(function() {
  // Self-executing function to create unique execution environment

  // Function to dynamically load the script with timestamp for cache busting
  function loadScriptWithTimestamp() {
    const timestamp = new Date().getTime();
    const scriptUrl = "https://cdn.jsdelivr.net/gh/sismaru/responsive-image-map/responsive-image-map.js" + "?v=" + timestamp;
    
    // Create script element
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    
    // Append to document
    document.head.appendChild(script);
    
    // Return promise that resolves when script loads
    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
  }

  // Load the script with timestamp
  loadScriptWithTimestamp().then(() => {
    // The main script logic - this will run after the timestamped script loads
    window.addEventListener('load', () => {
      const calcPercentage = (coord, dimension, ratio) => `${(coord / dimension) * 100 * ratio}%`;
      
      const processArea = (area, image, imageRatio) => {
        const coords = area.coords.split(',').map(Number);
        const shape = area.shape;
        const href = area.href;
        const aTag = document.createElement('a');
        
        // Transfer href attribute
        if (href) aTag.href = href;
        
        // Transfer onclick event
        if (area.getAttribute('onclick')) {
          const onclickValue = area.getAttribute('onclick');
          aTag.setAttribute('onclick', onclickValue);
        }
        
        // Transfer any other events or attributes
        Array.from(area.attributes).forEach(attr => {
          if (attr.name !== 'shape' && attr.name !== 'coords' && attr.name !== 'href') {
            aTag.setAttribute(attr.name, attr.value);
          }
        });
        
        aTag.style.position = 'absolute';
        const imageWidth = image.width;
        const imageHeight = image.height;
        
        if (shape === 'rect') {
          const [left, top, right, bottom] = coords;
          Object.assign(aTag.style, {
            left: calcPercentage(Math.min(left, right), imageWidth, imageRatio),
            top: calcPercentage(Math.min(top, bottom), imageHeight, imageRatio),
            width: calcPercentage(Math.abs(right - left), imageWidth, imageRatio),
            height: calcPercentage(Math.abs(bottom - top), imageHeight, imageRatio)
          });
        } else if (shape === 'circle') {
          const [x, y, radius] = coords;
          Object.assign(aTag.style, {
            left: calcPercentage(x, imageWidth, imageRatio),
            top: calcPercentage(y, imageHeight, imageRatio),
            width: calcPercentage(radius * 2, imageWidth, imageRatio),
            height: calcPercentage(radius * 2, imageHeight, imageRatio),
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          });
        } else if (shape === 'poly') {
          const xCoords = coords.filter((_, i) => i % 2 === 0);
          const yCoords = coords.filter((_, i) => i % 2 === 1);
          const minX = Math.min(...xCoords);
          const maxX = Math.max(...xCoords);
          const minY = Math.min(...yCoords);
          const maxY = Math.max(...yCoords);
          const width = maxX - minX;
          const height = maxY - minY;
          
          const clipPath = [];
          for (let i = 0; i < xCoords.length; i++) {
            const x = ((xCoords[i] - minX) / width) * 100;
            const y = ((yCoords[i] - minY) / height) * 100;
            clipPath.push(`${x}% ${y}%`);
          }
          
          Object.assign(aTag.style, {
            left: calcPercentage(minX, imageWidth, imageRatio),
            top: calcPercentage(minY, imageHeight, imageRatio),
            width: calcPercentage(width, imageWidth, imageRatio),
            height: calcPercentage(height, imageHeight, imageRatio),
            clipPath: `polygon(${clipPath.join(', ')})`
          });
        }
        
        return aTag;
      };
    
      document.querySelectorAll('img[usemap]').forEach(img => {
        const mapName = img.getAttribute('usemap').replace('#', '');
        const map = document.querySelector(`map[name="${mapName}"]`);
        if (!map) return; // Skip if map doesn't exist
        
        const imageRatio = img.width / img.naturalWidth;
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        map.querySelectorAll('area').forEach(area => {
          const aTag = processArea(area, img, imageRatio);
          wrapper.appendChild(aTag);
        });
        
        map.remove();
      });
    });
  }).catch(error => {
    console.error("Failed to load responsive image map script:", error);
  });
})();