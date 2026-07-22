import{Bt as e,Ht as t,Q as n,U as r,W as i,er as a,qn as o,qt as s,yn as c}from"./framework.BTQirQJB.js";import{t as l}from"./theme.B62cWSQb.js";import"./chunks/vue-i18n.Dk9JKhVE.js";import{a as u,i as d}from"./chunks/vue-router.SqDC-DRA.js";var f={__name:`2024-11-20-pygame-xue-xi-bi-ji-4`,setup(f,{expose:p}){let m=o(JSON.parse(`{"title":"Pygame学习笔记（4）","description":"","frontmatter":{"title":"Pygame学习笔记（4）","date":"2024-11-20","tags":["算法"]},"headers":[],"relativePath":"pages/posts/2024-11-20-pygame-xue-xi-bi-ji-4.md"}`)),h=u(),g=d(),_=Object.assign(g.meta.frontmatter||{},m.value?.frontmatter||{});return h.currentRoute.value.data=m.value,t(`valaxy:frontmatter`,_),globalThis.$frontmatter=_,p({frontmatter:{title:`Pygame学习笔记（4）`,date:`2024-11-20`,tags:[`算法`]}}),(t,o)=>{let u=l;return e(),i(u,{frontmatter:a(_)},{"main-content-md":c(()=>[...o[0]||=[r(`h2`,{id:`给场景添加一些别的地图元素`,tabindex:`-1`},[n(`给场景添加一些别的地图元素 `),r(`a`,{class:`header-anchor`,href:`#给场景添加一些别的地图元素`,"aria-label":`Permalink to "给场景添加一些别的地图元素"`},`​`)],-1),r(`p`,null,`这里视频中用到了pytmx，即地图绘制器，这里我们直接使用作者绘制好的地图。首先要确保电脑中安装了pytmx库。随后回到level.py中，将库导入。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`from pytmx.util_pygame import load_pygame`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在setup方法中我们创建地图的剩下的元素。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`tmx_data = load_pygame('../data/map.tmx')`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`#house`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`for layer in ['HouseFloor', 'HouseFurnitureBottom']:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`   for x,y,surf in tmx_data.get_layer_by_name(layer).tiles():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`       Generic((x * TILE_SIZE,y * TILE_SIZE),surf,self.all_sprites,LAYERS['house bottom'])`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`for layer in ['HouseWalls', 'HouseFurnitureTop']:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`   for x,y,surf in tmx_data.get_layer_by_name(layer).tiles():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`       Generic((x * TILE_SIZE,y * TILE_SIZE),surf,self.all_sprites)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`读取我们的地图数据，然后遍历地图中的元素，将其添加到我们的Generic类中，并绘制出来。这样就能绘画出房子了。接下来回到sprites.py中我们开始准备绘画水，向日葵和树。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`class Water(Generic):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,pos,frames,groups):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #animation setup`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.frames = frames`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.frame_index = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #sprite setup`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__(`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            pos = pos,`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            surf = self.frames[self.frame_index],`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            groups = groups,`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            z = LAYERS["water"])`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def animate(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.frame_index += 5 * dt`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if self.frame_index >= len(self.frames):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.frame_index = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.image = self.frames[int(self.frame_index)]`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def update(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.animate(dt)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class WildFlower(Generic):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,pos,surf,groups):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__(pos,surf,groups)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Tree(Generic):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,pos,surf,groups,name):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__(pos,surf,groups)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这三个类后续都需要增加而外的功能，所以我们分别增添一个新类来储存，并使他继承于原本的Generic类，由于水是有流动动画的，所以我们给它添加一个运动方法，幸运的是，之前我们在player中写了运动方法，这里依葫芦画瓢即可，向日葵和树我们暂且绘画出即可。回到level中我们导入这几个方法，并创造剩下的元素。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`        #water`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        water_frames = import_folder('../graphics/water')`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        for x,y,surf in tmx_data.get_layer_by_name('Water').tiles():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            Water((x * TILE_SIZE,y * TILE_SIZE),water_frames,self.all_sprites)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #trees`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        for obj in tmx_data.get_layer_by_name('Trees'):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            Tree((obj.x,obj.y),obj.image,self.all_sprites,obj.name)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #wildflowers`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        for obj in tmx_data.get_layer_by_name('Decoration'):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            WildFlower((obj.x,obj.y),obj.image,self.all_sprites)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这里的tiles方法是将地图中的每个元素对象都拆分成了，坐标和图片属性，由于树和花还有别的用处，这边就不拆分了（我猜测的），接下来你就可以看到动态的水，各类树和花了。`,-1),r(`h2`,{id:`覆盖显示问题`,tabindex:`-1`},[n(`覆盖显示问题 `),r(`a`,{class:`header-anchor`,href:`#覆盖显示问题`,"aria-label":`Permalink to "覆盖显示问题"`},`​`)],-1),r(`p`,null,`目前的player会走在所有它之下的图层上，会被所有比他图层高的给覆盖。而我们需要一个合理的覆盖，使得我们的play既可以藏在树后也可以在树前，而不是单纯的将树给覆盖。其实很简单解决，对我们的摄像机类做点小小的改动即可。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`class CameraGroup(pygame.sprite.Group):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.offset = pygame.math.Vector2()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def custom_draw(self,player):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.offset.x = player.rect.centerx - SCREEN_WIDTH / 2`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.offset.y = player.rect.centery - SCREEN_HEIGHT / 2`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        for layer in LAYERS.values():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            for sprite in sorted(self.sprites(), key = lambda sprite: sprite.rect.centery):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                if sprite.z == layer:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                    offset_rect = sprite.rect.copy()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                    offset_rect.center -= self.offset`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                    self.display_surface.blit(sprite.image, offset_rect)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`当循环绘制精灵组的时候，对我们的精灵组进行个重新排序，使得y轴更小的位于列表之前，更先绘制即可。lambda是python中保留的关键字，属于一个匿名函数，即没有函数名，如上文lambda sprite: sprite.rect.centery即为接受sprite参数，然后返回 sprite.rect.centery。`,-1),r(`p`,null,[n(`再看个例子：`),r(`code`,null,`add = lambda x, y: x+y`),r(`br`),n(` 相当于定义了加法函数`),r(`code`,null,`lambda x, y: x+y`),n(`，并将其赋值给变量`),r(`code`,null,`add`),n(`，这样变量`),r(`code`,null,`add`),n(`就指向了具有加法功能的函数。`),r(`br`),n(` 这时我们如果执行`),r(`code`,null,`add(1, 2)`),n(`，其输出结果就为 `),r(`code`,null,`3`),n(`。`)],-1)]]),"main-header":c(()=>[s(t.$slots,`main-header`)]),"main-header-after":c(()=>[s(t.$slots,`main-header-after`)]),"main-nav":c(()=>[s(t.$slots,`main-nav`)]),"main-content-before":c(()=>[s(t.$slots,`main-content-before`)]),"main-content":c(()=>[s(t.$slots,`main-content`)]),"main-content-after":c(()=>[s(t.$slots,`main-content-after`)]),"main-nav-before":c(()=>[s(t.$slots,`main-nav-before`)]),"main-nav-after":c(()=>[s(t.$slots,`main-nav-after`)]),comment:c(()=>[s(t.$slots,`comment`)]),footer:c(()=>[s(t.$slots,`footer`)]),aside:c(()=>[s(t.$slots,`aside`)]),"aside-custom":c(()=>[s(t.$slots,`aside-custom`)]),default:c(()=>[s(t.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{f as default};