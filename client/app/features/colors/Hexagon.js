import React from "react";
import { Svg } from "expo";
import PropTypes from "prop-types";

const Hexagon = props => {
  const {
    fill,
    width,
    bordered,
    borderColor,
    borderStrokeWidth,
    svgProps,
    hexagonProps,
    polylineProps
  } = props;

  const getHexagonComponents = width => {
    const { sin, PI } = Math;
    const sideLength = width / 2 / sin(PI / 3);
    const triangleHeight = sideLength * sin(PI / 6);
    const longDiagonal = sideLength + 2 * triangleHeight;
    return {
      sideLength,
      triangleHeight,
      longDiagonal
    };
  };

  const getHexagonPoints = width => {
    const { triangleHeight, longDiagonal } = getHexagonComponents(width);

    const x1 = 0;
    y1 = triangleHeight;
    x2 = width / 2;
    y2 = 0;
    x3 = width;
    y3 = triangleHeight;
    x4 = width;
    y4 = longDiagonal - triangleHeight;
    x5 = width / 2;
    y5 = longDiagonal;
    x6 = 0;
    y6 = longDiagonal - triangleHeight;

    const path = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6}`;
    return path;
  };

  const getBorderPoints = width => {
    const { triangleHeight, longDiagonal } = getHexagonComponents(width);
    const borderOffset = width / 100;

    const x1 = borderOffset;
    y1 = triangleHeight + borderOffset;
    x2 = width / 2;
    y2 = borderOffset;
    x3 = width - borderOffset;
    y3 = triangleHeight + borderOffset;
    x4 = width - borderOffset;
    y4 = longDiagonal - triangleHeight - borderOffset;
    x5 = width / 2;
    y5 = longDiagonal - borderOffset;
    x6 = borderOffset;
    y6 = longDiagonal - triangleHeight - borderOffset;
    x7 = x1;
    y7 = y1;

    const path = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6} ${x7}, ${y7}`;
    return path;
  };

  const { longDiagonal } = getHexagonComponents(width);
  const hexagonPoints = getHexagonPoints(width);
  const borderPoints = getBorderPoints(width);

  return (
    <Svg height={longDiagonal} width={width} {...svgProps}>
      <Svg.Polygon points={hexagonPoints} fill={fill} {...hexagonProps} />
      {bordered && (
        <Svg.Polyline
          points={borderPoints}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderStrokeWidth}
          {...polylineProps}
        />
      )}
    </Svg>
  );
};

Hexagon.defaultProps = {
  fill: "white",
  width: 100,
  bordered: false,
  borderColor: "white",
  borderStrokeWidth: "2",
  svgProps: {},
  hexagonProps: {},
  polylineProps: {}
};

Hexagon.propTypes = {
  fill: PropTypes.string,
  width: PropTypes.number,
  bordered: PropTypes.bool,
  borderColor: PropTypes.string,
  borderStrokeWidth: PropTypes.string,
  svgProps: PropTypes.object,
  hexagonProps: PropTypes.object,
  polylineProps: PropTypes.object
};

export default Hexagon;
