window.addEventListener('load', () => {
    const calcPercentage = (coord, dimension, ratio) => `${(coord / dimension) * 100 * ratio}%`;
  
    const processArea = (area, image, imageRatio) => {
      const coords = area.coords.split(',').map(Number);
      const shape = area.shape;
      const href = area.getAttribute('href');
      const aTag = document.createElement('a'); 
      aTag.setAttribute('href', href);
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
  
        const clipPath = coords.reduce((path, coord, i) => {
          const x = ((xCoords[Math.floor(i/2)] - minX) / width) * 100;
          const y = ((yCoords[Math.floor(i/2)] - minY) / height) * 100;
          return path + `${x}% ${y}%${i < coords.length - 1 ? ',' : ''}`;
        }, 'polygon(');
  
        Object.assign(aTag.style, {
          left: calcPercentage(minX, imageWidth, imageRatio),
          top: calcPercentage(minY, imageHeight, imageRatio),
          width: calcPercentage(width, imageWidth, imageRatio),
          height: calcPercentage(height, imageHeight, imageRatio),
          clipPath: clipPath + ')'
        });
      }
  
      return aTag;
    };
  
    document.querySelectorAll('img[usemap]').forEach(img => {
      const mapName = img.getAttribute('usemap').replace('#', '');
      const map = document.querySelector(`map[name="${mapName}"]`);
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