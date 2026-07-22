---
title: 最大子数组问题
date: 2025-01-11
tags:
  - 算法
---

本文我们将探讨下如何寻找一个数组的最大子数组。也就是找到其中的一个子数组，该子数组中的全部元素之和最大。前提是这个数组里面的数据有正有负，这样才有价值，不然全是正的很明显就是原本的那个数组。例如A=\[2,3,-5,1,-4,6,-2,1\],我们要寻找该数组的最大子数组，该如何做呢？这里我们的子数组元素至少为两个，不考虑只含有一个元素的数组。当然你要是愿意的话，也可以拿出来比较一番。

## 解决思路

很直接就能想到的就是，既然你需要比较所有的子数组的元素之和大小，那么我直接遍历它所有的子数组然后找出其中最大的一个。这当然可以，简单粗暴，但是未免太过繁琐了，毕竟你需要执行C<sup>2</sup><sub>n</sub> +C<sub>n</sub><sup>3</sup> +...+C<sub>n</sub><sup>n</sup> 次才能将其子数组给遍历完。

这里我们依旧采用前文所阐述过的分治法，用递归的思想将长数组短化，问题简化，直接上图说明。

![](/images/2025/01/202501-56f67f74.webp)如上图，我们将数组一直二分法划分将数组划分到只剩下一个元素为止，现在我们图中的前两行，如果要寻找到该数组的最大子数组，我们易知最大子数组可能的为止，即要不是位于2，3，-5，1中或-4，6，-2，1中或者是跨过原数组中点，如-5，1，-4，6。那如果我们再往下看一行，2，3，-5，1的最大子数组会在哪里呢？依葫芦画瓢向下推，直到数组中的元素只剩下一个，那么很明显此时的最大子数组就是它自己。接下来我们**从下向上看**，**先看2，3分支**，它的最大子数组既是在2和3和2，3中找寻一个最大子数组并返回回去，很明显是2，3。**右边的-5，1部分**，易知返回的是1，接下来往上看一层，也就是**2，3，-5，1**这层此时左边的2，3返回的子数组是它本身，不变，而右边的-5，1返回的是1，替换掉了-5，1，那么接下来就是在2，3和1和2，3，-5，1中找一个最大的子数组，所以，返回的是2，3这个数组。右边部分同理。最后就能求出来最大子数组了。

接下来我们要思考下如何求跨过中点的最大子数组。其实思路也很明确，我们从中点向两边递推，找到最大的左边子数组和右边子数组，最后相加在一起不就得行吗？直接看代码。

## 代码部分

```
def Find_Max_Subarray_cross_mid(Array):

    high = len(Array)
    low = 0
    mid = int((high + low)/2)

    sum = 0
    left_sum = float("-inf")
    left_idex = 0
    for x in range(mid,low,-1):
        sum += Array[x-1]
        if sum > left_sum:
            left_sum = sum
            left_idex = x-1

    sum = 0
    right_sum = float("-inf")
    right_idex = 0
    for y in range(mid,high):
        sum += Array[y]
        if sum > right_sum:
            right_sum = sum
            right_idex = y

    cross_sum = left_sum + right_sum
    return [left_idex,right_idex,cross_sum]
```

在第一块，我们就定下了该数组的左右中三个端点，第二块就是从中点向左端点递推找到最大左子数组，第三块就是从中点向右端点递推找到最大右子数组，由于我们是从中点出发的，所以直接将左右最大子数组相加在一起就可以得到跨过中点的最大子数组了。（代码中的float（“-inf”）是负无穷的意思）

现在我们能解决跨过中点的最大子数组，左右两边的最大子数组用分治法也能求出，那么就可以看总体代码了。

```
def Find_Max_Subarry(Array,low=0,high=0):
    low=0
    high=len(Array)-1
    if low == high:
        return [low,high,Array[0]]

    else:
        mid = int((low+high)/2)
        left_max_array = Find_Max_Subarry(Array[0:mid],low,mid)
        right_max_array = Find_Max_Subarry(Array[mid:high],mid,high)
        cross_max_array = Find_Max_Subarray_cross_mid(Array)

        if left_max_array[2] >= right_max_array[2] and left_max_array[2] >= cross_max_array[2]:
            return left_max_array
        elif right_max_array[2] >= left_max_array[2] and right_max_array[2] >= cross_max_array[2]:
            return right_max_array
        else:
            return cross_max_array
```

此函数接受数组和其上下标，第一部分就是考虑数组中只剩下一个元素的情况，此时我们将其本身返回回去，第二部分，就是分别计算其最大左子数组，最大右子数组，和跨过中点的最大子数组，最后将其中最大的返回即可。

## 写在最后

上文中的代码是有些问题的，例如会出现栈溢出的情况，还有，原本Find\_Max\_Subarry函数我也是只接收一个Array参数，并不接收上下标，但是却会出现返回只有单一元素的最大子数组，这不是我们所期望的，但是加了上下标的接收，反而不会出现这样的问题了（现在好像也有？）。这些问题就当作思考题交给富有聪明才智的你去解决了。