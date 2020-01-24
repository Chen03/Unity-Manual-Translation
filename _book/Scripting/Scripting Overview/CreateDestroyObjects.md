# 创建和销毁游戏对象 Creating and Destroying GameObjects

有一些游戏在场景中保持固定数量的对象，但对于角色、宝藏和其他对象来说，在游戏过程中创建和销毁它们是很常见的事。在 Unity，**GameObject**(游戏对象) 可以被 [Instantiate(实例化)](https://docs.unity3d.com/ScriptReference/Object.Instantiate.html) 方法创建，作为一个已存在的对象的副本：

```cs
public GameObject enemy;

void Start() {
    for (int i = 0; i < 5; i++) {
        Instantiate(enemy);
    }
}
```

注意被复制对象必须要在场景中显示。使用从编辑器中的 Project(项目) 面板拖到公共变量的 **prefab**(预制件) 更加常用。同时，实例化一个 GameObject 会复制所有在原对象上的 Components(组件)。

还有一个 [Destroy(销毁)](https://docs.unity3d.com/ScriptReference/Object.Destroy.html) 方法可以用来销毁对象，在帧更新完成后或者可选的短暂延时一会儿：

```cs
void OnCollisionEnter(Collision otherObj) {
    if (otherObj.gameObject.tag == "Missile") {
        Destroy(gameObject,.5f);
    }
}
```

注意 Destroy 方法可以摧毁个别组件而不影响 GameObject 自己。一个常见的错误：

```cs
 Destroy(this);
```

它只会摧毁调用这个函数的脚本组件，而不是摧毁它添加到的 GameObject。