//
//  ButtonManager.m
//  Rainbow
//
//  Created by Alexey Kureev on 16/01/2020.
//

#import "React/RCTViewManager.h"
#import "Rainbow-Swift.h"

@interface RCT_EXTERN_MODULE(ButtonManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPressStart, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLongPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(duration, NSTimeInterval)
RCT_EXPORT_VIEW_PROPERTY(pressOutDuration, NSTimeInterval)
RCT_EXPORT_VIEW_PROPERTY(enableHapticFeedback, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hapticType, NSString)
RCT_EXPORT_VIEW_PROPERTY(transformOrigin, CGPoint)
RCT_EXPORT_VIEW_PROPERTY(minLongPressDuration, NSTimeInterval)
RCT_EXPORT_VIEW_PROPERTY(scaleTo, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(useLateHaptic, BOOL)

@end

@implementation ButtonManager : RCTViewManager

- (UIView *)view {
  return [[Button alloc] init];
}

@end
