import React from 'react';
import { Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { setDisplayName } from 'recompact';
// Adding extra PanGestureHandler allows for capturing gesture
// before it got delivered to navigator
export default InnerComponent =>
  setDisplayName('HorizontalGestureBlocker')(props => (
    <PanGestureHandler minDeltaX={20} minDeltaY={1000}>
      <Animated.View>
        <InnerComponent {...props} />
      </Animated.View>
    </PanGestureHandler>
  ));
