---
title: Numpy库学习
date: 2024-12-25
tags:
  - 算法
---

安装，请在命令行中输入以下代码用于安装Numpy库，安装完后我们便可开始学习了。

```
pip install Numpy
```

## 数组

在python中我们输入

```
import Numpy as np

array = np.array([1,2,3,4,5])
```

如此以来便定义了一个Numpy中的数组，这个数组与python中的还有有些许差距，例如我们可以执行一下操作。

```
array_2 = array + 1
print(array_2)#[2,3,4,5]
```

而在python自带数组中我们给通过遍历列表的方式来对列表中的每个元素进行加一操作。同理，可以进行别的四则运算，其就等于对其中的每个元素进行该四则运算。

## 数组特性

```
array = np.array([1,2,3,4,5])
array.shape
#(5,)
```

这个方法显示出数组中所含有的元素数量与维度，在这里，元素个数为4，维度为1.

```
array = np.array([[1,2,3],
                  [4,5,6]])
```

如此便可定义一个二维数组，同理可推展到更高维度的数组之中。

需要注意的是，这里面的数组需要保证其中的元素是同一类型，否则数组会自动对其中的元素进行转化。

```
array = np.array([1,2,3,'4'])
print(array)#['1','2','3','4']
```

其转化规则为int—>float—>string

## 数组属性操作

```
array = np.array([1,2,3,4,5])
type(array)#numpy.ndarray
```

打印当前数据格式

```
array.dtype#dt
```