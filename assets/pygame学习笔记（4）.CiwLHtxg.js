import{$ as e,G as t,Jn as n,Jt as r,Ut as i,Vt as a,W as o,bn as s,tr as c}from"./framework.CjdSPkFv.js";import{n as l}from"./theme.Dt3khUt3.js";import"./reka-ui.CVRMFFNl.js";import{c as u,l as d}from"./chunks/vue-router.8e84d6cC.js";var f={__name:`pygame学习笔记（4）`,setup(f,{expose:p}){let m=n(JSON.parse(`{"title":"Pygame学习笔记（4）","description":"","frontmatter":{"title":"Pygame学习笔记（4）","date":"2024-11-20 11:44:12","categories":"未分类","tags":["算法"],"ogImage":"/og/default.png"},"headers":[{"level":2,"title":"给场景添加一些别的地图元素","slug":"给场景添加一些别的地图元素","link":"#给场景添加一些别的地图元素","children":[]},{"level":2,"title":"覆盖显示问题","slug":"覆盖显示问题","link":"#覆盖显示问题","children":[]}],"relativePath":"pages/posts/pygame学习笔记（4）.md","lastUpdated":1794066059000}`)),h=d(),g=u(),_=Object.assign(g.meta.frontmatter||{},m.value?.frontmatter||{});return h.currentRoute.value.data=m.value,i(`valaxy:frontmatter`,_),globalThis.$frontmatter=_,p({frontmatter:{title:`Pygame学习笔记（4）`,date:`2024-11-20 11:44:12`,categories:`未分类`,tags:[`算法`],ogImage:`/og/default.png`}}),(n,i)=>{let u=l;return a(),t(u,{frontmatter:c(_)},{"main-content-md":s(()=>[...i[0]||=[o(`h2`,{id:`给场景添加一些别的地图元素`,tabindex:`-1`},[e(`给场景添加一些别的地图元素 `),o(`a`,{class:`header-anchor`,href:`#给场景添加一些别的地图元素`,"aria-label":`Permalink to "给场景添加一些别的地图元素"`},`​`)],-1),o(`p`,null,`这里视频中用到了pytmx，即地图绘制器，这里我们直接使用作者绘制好的地图。首先要确保电脑中安装了pytmx库。随后回到level.py中，将库导入。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`from pytmx.util_pygame import load_pygame`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`在setup方法中我们创建地图的剩下的元素。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`tmx_data = load_pygame('../data/map.tmx')`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`#house`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`for layer in ['HouseFloor', 'HouseFurnitureBottom']:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`   for x,y,surf in tmx_data.get_layer_by_name(layer).tiles():`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`       Generic((x * TILE_SIZE,y * TILE_SIZE),surf,self.all_sprites,LAYERS['house bottom'])`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`for layer in ['HouseWalls', 'HouseFurnitureTop']:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`   for x,y,surf in tmx_data.get_layer_by_name(layer).tiles():`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`       Generic((x * TILE_SIZE,y * TILE_SIZE),surf,self.all_sprites)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`读取我们的地图数据，然后遍历地图中的元素，将其添加到我们的Generic类中，并绘制出来。这样就能绘画出房子了。接下来回到sprites.py中我们开始准备绘画水，向日葵和树。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`class Water(Generic):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self,pos,frames,groups):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        #animation setup`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.frames = frames`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.frame_index = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        #sprite setup`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        super().__init__(`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            pos = pos,`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            surf = self.frames[self.frame_index],`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            groups = groups,`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            z = LAYERS["water"])`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def animate(self,dt):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.frame_index += 5 * dt`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if self.frame_index >= len(self.frames):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.frame_index = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.image = self.frames[int(self.frame_index)]`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def update(self,dt):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.animate(dt)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class WildFlower(Generic):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self,pos,surf,groups):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        super().__init__(pos,surf,groups)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Tree(Generic):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self,pos,surf,groups,name):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        super().__init__(pos,surf,groups)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`这三个类后续都需要增加而外的功能，所以我们分别增添一个新类来储存，并使他继承于原本的Generic类，由于水是有流动动画的，所以我们给它添加一个运动方法，幸运的是，之前我们在player中写了运动方法，这里依葫芦画瓢即可，向日葵和树我们暂且绘画出即可。回到level中我们导入这几个方法，并创造剩下的元素。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`        #water`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        water_frames = import_folder('../graphics/water')`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        for x,y,surf in tmx_data.get_layer_by_name('Water').tiles():`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            Water((x * TILE_SIZE,y * TILE_SIZE),water_frames,self.all_sprites)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        #trees`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        for obj in tmx_data.get_layer_by_name('Trees'):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            Tree((obj.x,obj.y),obj.image,self.all_sprites,obj.name)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        #wildflowers`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        for obj in tmx_data.get_layer_by_name('Decoration'):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            WildFlower((obj.x,obj.y),obj.image,self.all_sprites)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`这里的tiles方法是将地图中的每个元素对象都拆分成了，坐标和图片属性，由于树和花还有别的用处，这边就不拆分了（我猜测的），接下来你就可以看到动态的水，各类树和花了。`,-1),o(`h2`,{id:`覆盖显示问题`,tabindex:`-1`},[e(`覆盖显示问题 `),o(`a`,{class:`header-anchor`,href:`#覆盖显示问题`,"aria-label":`Permalink to "覆盖显示问题"`},`​`)],-1),o(`p`,null,`目前的player会走在所有它之下的图层上，会被所有比他图层高的给覆盖。而我们需要一个合理的覆盖，使得我们的play既可以藏在树后也可以在树前，而不是单纯的将树给覆盖。其实很简单解决，对我们的摄像机类做点小小的改动即可。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`class CameraGroup(pygame.sprite.Group):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        super().__init__()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.offset = pygame.math.Vector2()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def custom_draw(self,player):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.offset.x = player.rect.centerx - SCREEN_WIDTH / 2`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.offset.y = player.rect.centery - SCREEN_HEIGHT / 2`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        for layer in LAYERS.values():`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            for sprite in sorted(self.sprites(), key = lambda sprite: sprite.rect.centery):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`                if sprite.z == layer:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`                    offset_rect = sprite.rect.copy()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`                    offset_rect.center -= self.offset`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`                    self.display_surface.blit(sprite.image, offset_rect)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`当循环绘制精灵组的时候，对我们的精灵组进行个重新排序，使得y轴更小的位于列表之前，更先绘制即可。lambda是python中保留的关键字，属于一个匿名函数，即没有函数名，如上文lambda sprite: sprite.rect.centery即为接受sprite参数，然后返回 sprite.rect.centery。`,-1),o(`p`,null,[e(`再看个例子：`),o(`code`,null,`add = lambda x, y: x+y`),o(`br`),e(` 相当于定义了加法函数`),o(`code`,null,`lambda x, y: x+y`),e(`，并将其赋值给变量`),o(`code`,null,`add`),e(`，这样变量`),o(`code`,null,`add`),e(`就指向了具有加法功能的函数。`),o(`br`),e(` 这时我们如果执行`),o(`code`,null,`add(1, 2)`),e(`，其输出结果就为\xA0`),o(`code`,null,`3`),e(`。`)],-1)]]),main:s(()=>[r(n.$slots,`main`)]),"main-header":s(()=>[r(n.$slots,`main-header`)]),"main-header-after":s(()=>[r(n.$slots,`main-header-after`)]),"main-nav":s(()=>[r(n.$slots,`main-nav`)]),"main-content-before":s(()=>[r(n.$slots,`main-content-before`)]),"main-content":s(()=>[r(n.$slots,`main-content`)]),"main-content-after":s(()=>[r(n.$slots,`main-content-after`)]),"main-nav-before":s(()=>[r(n.$slots,`main-nav-before`)]),"main-nav-after":s(()=>[r(n.$slots,`main-nav-after`)]),comment:s(()=>[r(n.$slots,`comment`)]),footer:s(()=>[r(n.$slots,`footer`)]),aside:s(()=>[r(n.$slots,`aside`)]),"aside-custom":s(()=>[r(n.$slots,`aside-custom`)]),default:s(()=>[r(n.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{f as default};