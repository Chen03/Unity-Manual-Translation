# Attributes

**Attributes** 是可以放在类，属性和方法上面的标记来表现特殊的行为。举个例子，你可以在一个属性声明上添加 `HideInInspector` attribute 来避免 **Inspector**(检查器) 显示这个属性，甚至它是公共的时候。C# 用方括号括住 attribute 名，像这样：

```cs
[HideInInspector]
public float strength;
```

Unity 提供了一系列 attributes，列在 API 参考文档里：

- 对与 UnityEngine attributes，查看 [AddComponentMenu](https://docs.unity3d.com/ScriptReference/AddComponentMenu.html) 和相关页面
- 对与 UnityEditor attributes，查看 [CallbackOrderAttribute](https://docs.unity3d.com/ScriptReference/CallbackOrderAttribute.html) 和相关页面

也有在 .NET 库里定义的 attributes，有时候在 Unity 代码里会有用。查看 [Microsoft’s documentation on Attributes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/attributes/) 获取更多信息。

**注意：**不要用 .NET 库里定义的 [ThreadStatic](http://msdn.microsoft.com/en-us/library/system.threadstaticattribute.aspx) attribute；如果你加到 Unity 脚本里会导致崩溃。