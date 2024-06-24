function editPost(postId) {
    // Redirect to edit post page with postId
    window.location.href = '/edit/' + postId;
  }
  
  function deletePost(postId) {
    // Send a DELETE request to delete the post
    fetch('/post/' + postId, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        // Redirect to the home page after successful deletion
        window.location.href = '/';
      } else {
        console.error('Failed to delete post');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  export { editPost, deletePost };