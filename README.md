```console
yarn install
yarn vite build --watch
```

Then apply this diff to `src/views/Tree.vue`:

```diff
diff --git a/src/views/Tree.vue b/src/views/Tree.vue
index 6a15adf7..8375dc98 100644
--- a/src/views/Tree.vue
+++ b/src/views/Tree.vue
@@ -16,7 +16,7 @@ along with this program.  If not, see <http://www.gnu.org/licenses/>.
 -->

 <template>
-  <div class="h-100">
+  <div class="h-100 foo">

   </div>
 </template>
```

It should get stuck on rebuild. If not, try undoing the change and then re-doing it a few times.
