import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AddCommentDto } from './dto/add-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { AddReplyDto } from './dto/add-reply.dto';
import { EditReplyDto } from './dto/edit-reply.dto';

@Controller('/blogs/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('/:postId')
  addComment(
    @Param('postId') postId: string,
    @Body() commentDto: AddCommentDto,
  ) {
    return this.commentsService.addComment(postId, commentDto);
  }

  @Get()
  getAllComments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.commentsService.getAllComments({ page, limit });
  }

  @Get('/:id')
  getCommentById(@Param('id') id: string) {
    return this.commentsService.getCommentById(id);
  }

  @Put('/:id')
  editComment(@Param('id') id: string, @Body() commentDto: EditCommentDto) {
    return this.commentsService.editComment(id, commentDto);
  }

  @Delete('/:id')
  deleteComment(@Param('id') id: string) {
    return this.commentsService.deleteComment(id);
  }

  /* Replies controller */
  @Post('/replies/:commendId')
  addReply(
    @Param('commentId') commentId: string,
    @Body() replyDto: AddReplyDto,
  ) {
    return this.commentsService.addReply(commentId, replyDto);
  }

  @Get('/replies/:id')
  getReplyById(@Param('id') id: string) {
    return this.commentsService.getReplyById(id);
  }

  @Put('/replies/:id')
  editReply(@Param('id') id: string, replyDto: EditReplyDto) {
    return this.commentsService.editReply(id, replyDto);
  }

  @Delete('/replies/:id')
  deleteReply(@Param('id') id: string) {
    return this.commentsService.deleteReply(id);
  }
}
