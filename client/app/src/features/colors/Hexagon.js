import React from 'react';
import Svg, { Polygon, Polyline } from 'react-native-svg';
import PropTypes from 'prop-types';

import Touchable from '../../components/Touchable';

const getHexagonComponents = width => {
  const { sin, PI } = Math;
  const sideLength = width / 2 / sin(PI / 3);
  const triangleHeight = sideLength * sin(PI / 6);
  const longDiagonal = sideLength + 2 * triangleHeight;
  return {
    sideLength,
    triangleHeight,
    longDiagonal,
  };
};

const getHexagonPoints = width => {
  const { triangleHeight, longDiagonal } = getHexagonComponents(width);

  const x1 = 0;
  const y1 = triangleHeight;
  const x2 = width / 2;
  const y2 = 0;
  const x3 = width;
  const y3 = triangleHeight;
  const x4 = width;
  const y4 = longDiagonal - triangleHeight;
  const x5 = width / 2;
  const y5 = longDiagonal;
  const x6 = 0;
  const y6 = longDiagonal - triangleHeight;

  const path = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6}`;
  return path;
};

const getBorderPoints = width => {
  const { triangleHeight, longDiagonal } = getHexagonComponents(width);
  const borderOffset = width / 100;

  const x1 = borderOffset;
  const y1 = triangleHeight + borderOffset;
  const x2 = width / 2;
  const y2 = borderOffset;
  const x3 = width - borderOffset;
  const y3 = triangleHeight + borderOffset;
  const x4 = width - borderOffset;
  const y4 = longDiagonal - triangleHeight - borderOffset;
  const x5 = width / 2;
  const y5 = longDiagonal - borderOffset;
  const x6 = borderOffset;
  const y6 = longDiagonal - triangleHeight - borderOffset;
  const x7 = x1;
  const y7 = y1;

  const path = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6} ${x7}, ${y7}`;
  return path;
};

const Hexagon = ({
  fill,
  width,
  onPress,
  bordered,
  borderColor,
  borderStrokeWidth,
  svgProps,
  hexagonProps,
  polylineProps,
}) => {

  const { longDiagonal } = getHexagonComponents(width);
  const hexagonPoints = getHexagonPoints(width);
  const borderPoints = getBorderPoints(width);

  return (
    <Touchable onPress={onPress}>
      <Svg height={longDiagonal} width={width} {...svgProps}>
        <Polygon points={hexagonPoints} fill={fill} {...hexagonProps} />
        {bordered && (
          <Polyline
            points={borderPoints}
            fill="none"
            stroke={borderColor}
            strokeWidth={borderStrokeWidth}
            {...polylineProps}
          />
        )}
      </Svg>
    </Touchable>
  );
};

Hexagon.defaultProps = {
  borderColor: 'white',
  bordered: false,
  borderStrokeWidth: '2',
  fill: 'white',
  hexagonProps: {},
  onPress: () => {},
  polylineProps: {},
  svgProps: {},
  width: 100,
};

Hexagon.propTypes = {
  borderColor: PropTypes.string,
  bordered: PropTypes.bool,
  borderStrokeWidth: PropTypes.string,
  fill: PropTypes.string,
  hexagonProps: PropTypes.object,
  onPress: PropTypes.func,
  polylineProps: PropTypes.object,
  svgProps: PropTypes.object,
  width: PropTypes.number,
};

export default Hexagon;
