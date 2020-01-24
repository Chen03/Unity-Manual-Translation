# 使用组件控制游戏对象 Controlling GameObjects using components

在 Unity 编辑器中，你可以使用 **Inspector**(检查器) 来更改 Component(组件) 的属性。
因此，例如，更改 **Transform Component**(转换组件) 的位置值将导致 GameObject(游戏对象) 的位置发生变化。同样，您更改 Renderer(渲染器) 材质的颜色或 **Rigidbody**(刚体) 的质量对游戏对象的外观或行为也会产生相应的影响。在大多数情况下，编写脚本也涉及修改组件属性以操作 **GameObjects**。但是，区别在于脚本可以在运行的时候修改属性的值或响应用户的输入。通过在正确的时间更改、创建和销毁对象，可以实现任何类型的游戏。

## 访问组件 Accessing components
最简单和最常见的情况是脚本需要访问附加到同一 GameObject 的其他 Component。如简介部分所述，Component 实际上是类的实例，因此第一步是获取需要使用的组件的实例的引用（好绕口）。这是使用 [GetComponent(获取组件)](https://docs.unity3d.com/ScriptReference/Component.GetComponent.html) 方法完成的。通常，您希望将 Component 对象分配给变量，这可以使用以下语句在 C# 中完成：

```csharp
void Start () 
{
    Rigidbody rb = GetComponent<Rigidbody>();
}
```

对组件实例进行引用后，可以像在检查器中那样设置其属性的值：

```csharp
void Start () 
{
    Rigidbody rb = GetComponent<Rigidbody>();
    
    // 更改对象的 Rigidbody 的质量值。
    rb.mass = 10f;
}
```

一个 Inspector 做不到的附加功能是可以调用 Component 实例上的方法：

```csharp
void Start ()
{
    Rigidbody rb = GetComponent<Rigidbody>();
    
    // 给 Rigidbody 加力。
    rb.AddForce(Vector3.up * 10f);
}
```

另外，请注意，可以将多个自定义脚本附加到同一对象。如果需要从一个脚本访问另一个脚本，可以像往常一样使用 GetComponent 方法，只需使用脚本类的名称（或文件名）来指定所需的组件类型。
如果尝试检索尚未实际添加到该 GameObject 的组件，则 GetComponent 方法将返回 null。如果尝试更改 null 对象上的任何值，将在运行时将出现空引用错误（null reference error）。

## 访问其他对象 Accessing other objects
虽然有时对象们单独工作，但通常一个对象脚本会与其他对象有联系。例如，追击的敌人可能需要知道玩家的位置。Unity 提供了多种不同的方式来检索其他对象，每个方式都适合某些情况。

## 使用变量链接游戏对象 Linking GameObjects with variables
查找相关 GameObject 的最直接方法是向脚本添加公共 GameObject 变量：

```cs
public class Enemy : MonoBehaviour
{
    public GameObject player;
    
    // 其他方法和变量...
}
```

此变量将在检查器中像任何其他变量一样可见：

![](https://docs.unity3d.com/uploads/Main/GameObjectPublicVar.png)
  
您现在可以将对象从 **scene**(场景) 或 Hierarchy(层次结构) 面板上拖到相应的变量上以分配它。GetComponent 函数和访问 Component 的值这两个操作与任何其他对象一样可用于此对象，因此可以使用如下所示的代码：

```cs
public class Enemy : MonoBehaviour {
    public GameObject player;
    
    void Start() {
        // 在角色背后启动10单位的敌人。
        transform.position = player.transform.position - Vector3.forward * 10f;
    }
}
```

此外，如果在脚本中声明 Component 类型的变量为公共变量，则可以添加任何有这种 Component 的 GameObject。这将直接访问 GameObject 的 Component，而不是 GameObject 本身。

```cs
public Transform playerTransform;
```

在处理具有永久连接的单个对象时，将对象与变量链接在一起最有用。可以使用数组链接同一类型的多个对象，但链接仍必须在 Unity 编辑器中进行，而不是在运行时进行。在运行时查找对象通常很方便，Unity 提供了两种基本方法，如下所述。

## 查找子游戏对象 Finding child GameObjects

有时，游戏场景会使用许多相同类型的游戏对象，例如敌人、路径点和障碍物。这些可能需要由监督或响应它们的特定脚本进行跟踪（例如，所有路径点可能需要可用于路径查找脚本）。使用变量链接这些 GameObjects 是可能的，但如果每个新必须拖动到脚本上的变量上，则设计过程会变得单调乏味。同样，如果删除了一个路径点，那么必须删除对缺少的 GameObject 的变量引用是一种困扰。在这种情况下，通常最好统一管理一组游戏对象，使它们成为一个父的所有子对象。可以使用父对象的 Transform 组件检索子对象（因为所有GameObject都隐式具有 Transform 组件）：

```cs
using UnityEngine;

public class WaypointManager : MonoBehaviour {
    public Transform[] waypoints;
    
    void Start() 
    {
        waypoints = new Transform[transform.childCount];
        int i = 0;
        
        foreach (Transform t in transform)
        {
            waypoints[i++] = t;
        }
    }
}
```

您还可以使用 [Transform.Find](https://docs.unity3d.com/ScriptReference/Transform.Find.html) 函数按名称查找特定子对象：

```cs
transform.Find("Gun"); 
```

当对象具有可以在游戏过程中添加和删除的子对象时，这非常有用。可以拿起并放下的武器就是一个很好的例子。

## 按名称或标签查找游戏对象 Finding GameObjects by Name or Tag
只要您有一些信息来标识它们，就可以在场景层次结构的任意位置找到游戏对象。可以使用 [GameObject.Find](https://docs.unity3d.com/ScriptReference/GameObject.Find.html) 函数按名称检索单个对象：

```cs
GameObject player;

void Start() 
{
    player = GameObject.Find("MainHeroCharacter");
}
```

对象或对象集合也可以通过其标记使用 [GameObject.FindWithTag]() 和 [GameObject.FindGameObject]() 与标记函数进行定位：

```cs
GameObject player;
GameObject[] enemies;

void Start() 
{
    player = GameObject.FindWithTag("Player");
    enemies = GameObject.FindGameObjectsWithTag("Enemy");
}
```