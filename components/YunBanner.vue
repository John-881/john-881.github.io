<script lang="ts" setup>
/**
 * 覆盖主题的 YunBanner：本站要求首页开屏动画始终播放。
 *
 * valaxy-theme-yun@1.2.0 自上游 012ba2ea「honor prefers-reduced-motion globally (#765)」
 * （2026-10-17）起会读取 prefers-reduced-motion: reduce，系统开启「减少动态效果」时
 * 跳过 500ms + duration 的等待、瞬间进入终态；此处去掉该判断，使电脑端与手机端行为一致。
 *
 * 来源：node_modules/valaxy-theme-yun/components/YunBanner.vue @1.2.0
 * 维护：主题升级后对照上游同文件核对模板/样式差异，仅保留「移除 reduced-motion 跳过」这一处改动。
 */
import type { CSSProperties } from 'vue'
import { sleep } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useThemeConfig } from 'valaxy-theme-yun/composables/config.ts'
import { useYunBanner } from 'valaxy-theme-yun/composables/useYunBanner.ts'
import { useYunAppStore } from 'valaxy-theme-yun/stores/app.ts'

const yun = useYunAppStore()
const themeConfig = useThemeConfig()

// height of top/bottom line

const { totalCharHeight, chars, bannerTitle } = useYunBanner(themeConfig.value.banner || { enable: true, title: '' })

const bannerStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    '--total-char-height': `${totalCharHeight.value}rem`,
    '--banner-line-height': `calc(var(--banner-height, 100 * var(--vh)) / 2 - ${totalCharHeight.value / 2}rem)`,
    'justify-content': 'space-between',
  }
  if (yun.isStrato)
    styles.borderBottom = `1px solid var(--yun-banner-divider-color, var(--banner-line-color))`

  return styles
})

const lineStatus = ref<
  'enter' | 'active' | 'exit' | ''
>('enter')
const lineStatusClass = computed(() => {
  return lineStatus.value
})

const animationStatus = ref('banner')

onMounted(async () => {
  // Reset banner animation state to ensure prologue waits for banner
  // This is needed when navigating back from post to home (SPA navigation)
  yun.bannerAnimationDone = false

  await sleep(500)
  lineStatus.value = 'active'
  if (yun.isNimbo) {
    await sleep(themeConfig.value.banner?.duration || 500)
    lineStatus.value = 'exit'

    animationStatus.value = 'prologue'
    yun.bannerAnimationDone = true
  }
})
</script>

<template>
  <div id="yun-banner" border="b-1px b-solid" :style="bannerStyles">
    <div class="banner-line-container">
      <div
        class="banner-line vertical-line-top"
        :class="lineStatusClass"
      />
    </div>

    <template v-if="yun.isNimbo">
      <YunBannerCharContainer
        v-if="animationStatus === 'banner'"
        :title="bannerTitle"
        :chars="chars"
      />
    </template>
    <template v-if="yun.isStrato">
      <YunBannerCharContainer
        :title="bannerTitle"
        :chars="chars"
      />
    </template>

    <div class="banner-line-container bottom">
      <div
        class="banner-line vertical-line-bottom"
        :class="lineStatusClass"
      />
    </div>
    <YunGoDown />
  </div>
</template>

<style lang="scss">
@use "valaxy-theme-yun/styles/widgets/banner.scss" as *;
@use "valaxy-theme-yun/styles/modules/prologue.scss" as *;

// --banner-* color tokens live in styles/css-vars.scss
#yun-banner {
  border-bottom-color: var(--yun-banner-divider-color, var(--banner-line-color));
}
</style>
