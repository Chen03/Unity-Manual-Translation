# 变量和查看器 Variables and the Inspector

创建脚本时，实质上是创建自己的新类型的组件，这些组件可以像任何其他组件一样附加到游戏对象中。

正如其他组件通常具有可在 Inspector(查看器) 中编辑的属性一样，您也可以允许脚本中的变量可以从 Inspector(查看器) 中编辑。

```csharp
using UnityEngine;
using System.Collections;

public class MainPlayer : MonoBehaviour 
{
    public string myName;
    
    // 用这个初始化
    void Start () 
    {
        Debug.Log("I am alive and my name is " + myName);
    }
}
```

此代码在查看器中创建一个标记为“myName(我的姓名)”的可编辑字段。

![](https://docs.unity3d.com/uploads/Main/EditingVarInspector.png)
 
Unity 通过在变量名称中出现大写字母的位置后引入一个空格来创建查看器标签。但是，这纯粹是为了显示目的，您应始终在代码中使用变量名称。如果您编辑名称，然后按 Play(播放)，您将看到该消息包含您输入的文本。
 
在 C# 中，必须将变量声明为公共变量才能在查看器中看到它。
Unity 实际上允许您在游戏运行时更改脚本中公共变量的值。这对于直接查看修改后的效果非常有用，且无需停止和重新编译。游戏结束时，变量的值将重置为您按下 Play 之前的值。这确保您可以自由地调整对象的设置，而不必担心造成任何永久性的破坏。
