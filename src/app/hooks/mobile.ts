/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react'
import useThrottledCallback from 'beautiful-react-hooks/useThrottledCallback'
import useWindowResize from 'beautiful-react-hooks/useWindowResize'

import { isLessThanBreakpoint, isMoreThanBreakpoint } from '@/utils/mobile'
import type { ScreensConfig } from 'tailwindcss/types/config'
import config from '../../../tailwind.config'

type AxisScreensConfig = {
  sm: string
  md: string
  lg: string
  xl: string
} & ScreensConfig

// Creates a hook for tracking whether the current window is below a certain breakpoint
const createHookFromBreakpoint = (breakpoint: string) => (): boolean => {
  const [belowBreakpoint, setBelowBreakpoint] = useState(isLessThanBreakpoint(breakpoint))
  const onWindowResize = useWindowResize()

  const options = {
    leading: false,
    trailing: true,
  }

  const onWindowResizeHandler = useThrottledCallback(
    () => {
      setBelowBreakpoint(isLessThanBreakpoint(breakpoint))
    },
    [breakpoint],
    500,
    options
  )

  onWindowResize(onWindowResizeHandler)

  return belowBreakpoint
}

const createHookFromBreakpointRange = (min: string, max: string) => (): boolean => {
  const [minBreakpoint, setMinBreakpoint] = useState<boolean>(isMoreThanBreakpoint(min))
  const [maxBreakpoint, setMaxBreakpoint] = useState<boolean>(isLessThanBreakpoint(max))
  const onWindowResize = useWindowResize()

  const options = {
    leading: false,
    trailing: true,
  }

  const onWindowResizeHandler = useThrottledCallback(
    () => {
      setMaxBreakpoint(isLessThanBreakpoint(min))
      setMinBreakpoint(isMoreThanBreakpoint(max))
    },
    [min, max],
    500,
    options
  )

  onWindowResize(onWindowResizeHandler)

  return minBreakpoint && maxBreakpoint
}

export const useIsMobile = createHookFromBreakpoint(
  (config.theme?.screens as AxisScreensConfig)?.sm
)

export const useIsTabletOrMobile = createHookFromBreakpointRange(
  '0px',
  (config.theme?.screens as AxisScreensConfig)?.lg
)

export const useIsTablet = createHookFromBreakpointRange(
  (config.theme?.screens as AxisScreensConfig)?.sm,
  (config.theme?.screens as AxisScreensConfig)?.lg
)

export const useIsDesktopOrXL = createHookFromBreakpointRange(
  (config.theme?.screens as AxisScreensConfig)?.md,
  (config.theme?.screens as AxisScreensConfig)?.xl
)

export const useIsDesktop = createHookFromBreakpointRange(
  (config.theme?.screens as AxisScreensConfig)?.md,
  (config.theme?.screens as AxisScreensConfig)?.lg
)

export const useIsXLDesktop = createHookFromBreakpointRange(
  (config.theme?.screens as AxisScreensConfig)?.lg,
  (config.theme?.screens as AxisScreensConfig)?.xl
)
