package usecase

import (
	"errors"
	"freepass-bcc/app/post/repository"
	"net/http"

	"freepass-bcc/domain"
	"freepass-bcc/help"

	"github.com/gin-gonic/gin"
)

type IPostUsecase interface {
	GetAllPost() ([]domain.PostResponse, any)
	GetPost(postId int) (domain.Posts, any)
	CreatePost(c *gin.Context, postRequest domain.PostRequest) (domain.PostResponse, any)
	UpdatePost(c *gin.Context, postRequest domain.PostRequest, postId int) (domain.PostResponse, any)
	DeletePost(c *gin.Context, postId int) (domain.PostResponse, any)
}

type PostUsecase struct {
	postRepository repository.IPostRepository
}

func NewPostUsecase(postRepository repository.IPostRepository) *PostUsecase {
	return &PostUsecase{postRepository}
}

func (u *PostUsecase) GetAllPost() ([]domain.PostResponse, any) {
	var posts []domain.Posts
	err := u.postRepository.GetAllPost(&posts)
	if err != nil {
		return []domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusInternalServerError,
			Message: "error occured when get all post",
			Err:     err,
		}
	}

	var postResponses []domain.PostResponse
	for _, p := range posts{
		postResponse := help.PostResponse(p, "")

		postResponses = append(postResponses, postResponse)
	}
	

	return postResponses, nil
}

func (u *PostUsecase) GetPost(postId int) (domain.Posts, any) {
	var post domain.Posts
	err := u.postRepository.GetPostByCondition(&post, "id = ?", postId)
	if err != nil {
		return domain.Posts{}, help.ErrorObject{
			Code:    http.StatusNotFound,
			Message: "post not found",
			Err:     err,
		}
	}

	return post, nil
}

func (u *PostUsecase) CreatePost(c *gin.Context, postRequest domain.PostRequest) (domain.PostResponse, any) {
	loginUser, err := help.GetLoginUser(c)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusNotFound,
			Message: "account not found",
			Err:     err,
		}
	}

	var post domain.Posts
	post.UserID = loginUser.ID
	post.Post = postRequest.Post

	err = u.postRepository.CreatePost(&post)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusInternalServerError,
			Message: "error occured when create post",
			Err:     err,
		}
	}

	postResponse := help.PostResponse(post, loginUser.Name)

	return postResponse, nil
}

func (u *PostUsecase) UpdatePost(c *gin.Context, postRequest domain.PostRequest, postId int) (domain.PostResponse, any) {
	loginUser, err := help.GetLoginUser(c)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusNotFound,
			Message: "account not found",
			Err:     err,
		}
	}

	var post domain.Posts
	err = u.postRepository.GetPostByCondition(&post, "id = ?", postId)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusNotFound,
			Message: "post not found",
			Err:     err,
		}
	}

	if loginUser.ID != post.UserID {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusBadRequest,
			Message: "can't edit other candidate post",
			Err:     errors.New("access denied"),
		}
	}

	post.Post = postRequest.Post
	err = u.postRepository.UpdatePost(&post)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusInternalServerError,
			Message: "error occured when update post",
			Err:     err,
		}
	}

	postResponse := help.PostResponse(post, loginUser.Name)

	return postResponse, nil
}

func (u *PostUsecase) DeletePost(c *gin.Context, postId int) (domain.PostResponse, any) {
	loginUser, err := help.GetLoginUser(c)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusNotFound,
			Message: "account not found",
			Err:     err,
		}
	}

	var post domain.Posts
	err = u.postRepository.GetPostByCondition(&post, "id = ?", postId)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusNotFound,
			Message: "post not found",
			Err:     err,
		}
	}

	if loginUser.Role != "ADMIN" && loginUser.ID != post.UserID {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusBadRequest,
			Message: "can't delete other candidate post",
			Err:     errors.New("access denied"),
		}
	}

	err = u.postRepository.DeletePost(&post)
	if err != nil {
		return domain.PostResponse{}, help.ErrorObject{
			Code:    http.StatusInternalServerError,
			Message: "error occured when delete post",
			Err:     err,
		}
	}

	postResponse := help.PostResponse(post, loginUser.Name)

	return postResponse, nil
}
