# 协同函数 Conroutines

当你调用一个函数时，它会一直运行到它返回。这实际上意味着任何在函数中进行的动作必须在单次帧更新中发生；一次函数调用不能够包含渐变的动画或者一系列与时间有关的事件。举个核桃，我们要逐渐减少一个对象的 alpha 值（可见度）直到它完全不可见：

```cs
void Fade() 
{
    for (float ft = 1f; ft >= 0; ft -= 0.1f) 
    {
        Color c = renderer.material.color;
        c.a = ft;
        renderer.material.color = c;
    }
}
```

如你所料，Fade(褪色) 方法不会发挥出你预期的效果。为了让褪色的过程可见，alpha 值必须在一段帧中逐渐减少来让中间的过程被渲染。但是，这段代码会在一帧之中执行完毕。中间值永远不会被看见，而对象会瞬间消失。

一个可能的解决方案是在 Update(更新) 方法中增加每一帧都褪色一点的代码来实现。可是，用协同函数(coroutine)来实现这类工作更加方便。

协同函数像是一种能够暂停执行并把控制权返回 Unity，但在随后的帧又可以在中断的地方继续的函数。在 C# 中，协同函数像这样声明：

```cs
IEnumerator Fade() 
{
    for (float ft = 1f; ft >= 0; ft -= 0.1f) 
    {
        Color c = renderer.material.color;
        c.a = ft;
        renderer.material.color = c;
        yield return null;
    }
}
```

它本质上是一个返回值类型为 IEnumerator 和有 `yield return` 语句的方法。`yield return null` 行是程序暂停和在接下来的帧恢复的点。要使协同方法开始运行，你要用到 [StartCoroutine](https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html) 方法：

```cs
void Update()
{
    if (Input.GetKeyDown("f")) 
    {
        StartCoroutine("Fade");
    }
}
```

你会注意到循环计数器在协同函数的生命周期内保持了它当前的值。实际上，任何变量或者参数在函数执行的间隙都会正确地保存。

默认协同函数会在暂停之后的下一帧恢复，但你也可以用 [WaitForSeconds](https://docs.unity3d.com/ScriptReference/WaitForSeconds.html) 实现延时：

```cs
IEnumerator Fade() 
{
    for (float ft = 1f; ft >= 0; ft -= 0.1f) 
    {
        Color c = renderer.material.color;
        c.a = ft;
        renderer.material.color = c;
        yield return new WaitForSeconds(.1f);
    }
}
```

这个方法是把效果延伸一段时间的一种途径，但也是一种有用的优化手段。许多游戏中的任务需要逐渐进行，而最显然的方式是把代码放进 Update 方法中。但是，Update 方法每秒钟会被调用很多次。当一个任务不需要被如此频繁地调用时，你可以把它放在协同函数中来定期更新，但不是每一帧。一个例子是警告玩家敌人接近的警告。代码看起来长这样：

```cs
function ProximityCheck() 
{
    for (int i = 0; i < enemies.Length; i++)
    {
        if (Vector3.Distance(transform.position, enemies[i].transform.position) < dangerDistance) {
                return true;
        }
    }
    
    return false;
}
```

如果有很多敌人，每一帧都调用这个方法可能会导致严重的过载。取而代之，你可以使用协同函数来每秒调用十次：

```cs
IEnumerator DoCheck() 
{
    for(;;) 
    {
        ProximityCheck();
        yield return new WaitForSeconds(.1f);
    }
}
```

这会大大减少检查的次数，而游戏过程不会产生任何可察觉的改变。

注意：你可以用 [StopCoroutine](https://docs.unity3d.com/ScriptReference/MonoBehaviour.StopCoroutine.html) 和 [StopAllCoroutines](https://docs.unity3d.com/ScriptReference/MonoBehaviour.StopAllCoroutines.html) 停止一个协同函数。当协同函数添加到的 **GameObject**(游戏对象) 被用 [SetActive(false)](https://docs.unity3d.com/ScriptReference/GameObject.SetActive.html) 禁用的时候也会停止。调用`Destroy(example)`（当 `example` 是一个 MonoBehaviour 实例的时候）会马上触发 `OnDisable` 且协同函数会被调用，以有效地将它停止。最终，`OnDestroy` 会在帧结束的时候被调用。

当通过设置 [enable](https://docs.unity3d.com/ScriptReference/Behaviour-enabled.html) 为 false 来禁用 MonoBehaivour 实例时，协同函数**不会**停止。